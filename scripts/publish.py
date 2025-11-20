import os
import json
import base64
import requests
from slugify import slugify

# Constants for Notion API
NOTION_QUERY_URL = "https://api.notion.com/v1/databases/{db}/query"
NOTION_PAGE_URL = "https://api.notion.com/v1/pages/{id}"

# Load environment variables
NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DB_ID = os.environ.get("NOTION_DB_ID")
WP_BASE_URL = os.environ.get("WP_BASE_URL")
WP_USER = os.environ.get("WP_USER")
WP_APP_PASSWORD = os.environ.get("WP_APP_PASSWORD")

# Setup headers for Notion API requests
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


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
        headers=NOTION_HEADERS,
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


def post_to_wordpress(title: str, content: str, slug: str, excerpt: str):
    """Post content to WordPress via REST API and return the permalink."""
    if not all([WP_BASE_URL, WP_USER, WP_APP_PASSWORD]):
        raise ValueError("WordPress credentials not configured")

    credentials = f"{WP_USER}:{WP_APP_PASSWORD}"
    token = base64.b64encode(credentials.encode()).decode()

    wp_headers = {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json",
    }

    payload = {
        "title": title,
        "content": content,
        "slug": slug,
        "excerpt": excerpt,
        "status": "publish",
    }

    wp_url = f"{WP_BASE_URL.rstrip('/')}/wp-json/wp/v2/posts"
    response = requests.post(wp_url, headers=wp_headers, data=json.dumps(payload))
    response.raise_for_status()

    result = response.json()
    return result.get("link", "")


def mark_published(page_id: str, publish_url: str):
    """Update Notion page status to 'Published' and set the publish URL."""
    payload = {
        "properties": {
            "Status": {"select": {"name": "Published"}},
            "Publish URL": {"url": publish_url},
        }
    }
    response = requests.patch(
        NOTION_PAGE_URL.format(id=page_id),
        headers=NOTION_HEADERS,
        data=json.dumps(payload)
    )
    response.raise_for_status()


def main():
    if not NOTION_API_KEY or not NOTION_DB_ID:
        print("Error: Notion API key or database ID not set.")
        return

    if not all([WP_BASE_URL, WP_USER, WP_APP_PASSWORD]):
        print("Error: WordPress credentials not configured.")
        return

    pages = fetch_ready_pages(NOTION_DB_ID)
    if not pages:
        print("No pages in Ready status.")
        return

    published_count = 0
    failed_count = 0

    for page in pages:
        try:
            props = page["properties"]
            page_id = page["id"]

            title = extract_text(props["Title"])
            slug_raw = extract_text(props.get("Slug", {"type": "rich_text", "rich_text": []}))
            slug = slugify(slug_raw or title)[:80]
            excerpt = extract_text(props.get("Outline", {"type": "rich_text", "rich_text": []}))[:155]
            content = extract_text(props.get("Notes", {"type": "rich_text", "rich_text": []}))

            if not title or not content:
                print(f"Skipping page {page_id}: Missing title or content")
                failed_count += 1
                continue

            print(f"Publishing: {title}")
            permalink = post_to_wordpress(title, content, slug, excerpt)

            if permalink:
                mark_published(page_id, permalink)
                print(f"  ✓ Published: {permalink}")
                published_count += 1
            else:
                print(f"  ✗ Failed: No permalink returned")
                failed_count += 1

        except Exception as e:
            print(f"  ✗ Error publishing page {page.get('id', 'unknown')}: {str(e)}")
            failed_count += 1
            continue

    print(f"\nSummary: {published_count} published, {failed_count} failed")


if __name__ == "__main__":
    main()