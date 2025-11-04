import os
import json
import requests
from slugify import slugify
from jinja2 import Template

# Constants for Notion API
NOTION_QUERY_URL = "https://api.notion.com/v1/databases/{db}/query"
NOTION_PAGE_URL = "https://api.notion.com/v1/pages/{id}"

# Load environment variables
NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DB_ID = os.environ.get("NOTION_DB_ID")
SITE_BASE_URL = os.environ.get("SITE_BASE_URL", "")
GA4_ID = os.environ.get("GA4_MEASUREMENT_ID", "")

# Setup headers for Notion API requests
HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

# HTML template for rendering posts
HTML_TEMPLATE = Template("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>{{ title }}</title>
    <meta name="description" content="{{ meta }}"/>
    <link rel="canonical" href="{{ canonical }}"/>
    <meta property="og:title" content="{{ title }}"/>
    <meta property="og:description" content="{{ meta }}"/>
    {% if ga4 %}
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ ga4 }}"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ ga4 }}');
    </script>
    {% endif %}
</head>
<body>
<div class="disclosure"><strong>Affiliate note:</strong> We may earn on links. It never changes your price.</div>
<h1>{{ title }}</h1>
{{ content | safe }}
</body>
</html>""")


def fetch_ready_pages(db_id: str):
    """Query Notion database for rows where Status equals 'Ready'."""
    payload = {
        "filter": {
            "property": "Status",
            "select": {"equals": "Ready"},
        },
        "page_size": 20,
    }
    response = requests.post(
        NOTION_QUERY_URL.format(db=db_id),
        headers=HEADERS,
        data=json.dumps(payload),
    )
    response.raise_for_status()
    return response.json().get("results", [])


def extract_text(prop):
    """Extract plain text from Notion property."""
    if prop["type"] == "title":
        return "".join([block.get("plain_text", "") for block in prop.get("title", [])])
    if prop["type"] == "rich_text":
        return "".join([block.get("plain_text", "") for block in prop.get("rich_text", [])])
    return ""


def render_page(page):
    """Render a Notion page row to HTML file."""
    props = page["properties"]
    title = extract_text(props["Title"])
    slug_raw = extract_text(props.get("Slug", {"type": "rich_text", "rich_text": []}))
    slug = slugify(slug_raw or title)[:80]
    meta = extract_text(props.get("Outline", {"type": "rich_text", "rich_text": []}))[:155]
    content = extract_text(props.get("Notes", {"type": "rich_text", "rich_text": []}))
    canonical = f"{SITE_BASE_URL}/{slug}.html" if SITE_BASE_URL else ""
    html = HTML_TEMPLATE.render(
        title=title,
        meta=meta,
        content=content,
        canonical=canonical,
        ga4=GA4_ID,
    )
    file_path = f"{slug}.html"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html)
    return page["id"], slug


def mark_published(page_id: str, slug: str):
    """Update Notion page status to 'Published' and set the publish URL."""
    publish_url = f"{SITE_BASE_URL}/{slug}.html" if SITE_BASE_URL else ""
    payload = {
        "properties": {
            "Status": {"select": {"name": "Published"}},
            "Publish URL": {"url": publish_url},
        }
    }
    response = requests.patch(
        NOTION_PAGE_URL.format(id=page_id), headers=HEADERS, data=json.dumps(payload)
    )
    response.raise_for_status()


def write_sitemap_and_robots():
    """Generate sitemap.xml and robots.txt based on the current HTML files."""
    if not SITE_BASE_URL:
        return
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    with open('sitemap.xml', 'w', encoding='utf-8') as sm:
        sm.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        sm.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for html_file in html_files:
            sm.write(f'  <url><loc>{SITE_BASE_URL}/{html_file}</loc></url>\n')
        sm.write('</urlset>')
    with open('robots.txt', 'w', encoding='utf-8') as rb:
        rb.write('User-agent: *\n')
        rb.write('Allow: /\n')
        rb.write(f'Sitemap: {SITE_BASE_URL}/sitemap.xml\n')


def main():
    if not NOTION_API_KEY or not NOTION_DB_ID:
        print("Notion API key or database ID not set.")
        return
    pages = fetch_ready_pages(NOTION_DB_ID)
    if not pages:
        print("No pages in Ready status.")
    for page in pages:
        page_id, slug = render_page(page)
        mark_published(page_id, slug)
    write_sitemap_and_robots()
    print(f"Published {len(pages)} page(s).")


if __name__ == "__main__":
    main()