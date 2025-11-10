# Maximum Automation Playbook

This guide shows you how to automate 80-90% of running an affiliate site, reducing daily work from 2-3 hours to 15-30 minutes.

## 🎯 Goal: Minimize Manual Work, Maximize Output

**Current state:** Publishing is automated (Notion → GitHub → Live)
**Target state:** Content creation, social media, SEO, and email marketing are 80% automated

---

## 🤖 Automation Level Breakdown

| Task | Manual (Hours/Week) | Automated (Hours/Week) | Automation % |
|------|---------------------|------------------------|--------------|
| Publishing | 5h | 0h | ✅ 100% |
| Content creation | 10-15h | 2-3h | 🟡 80% |
| Social media | 7-10h | 1-2h | 🟡 85% |
| SEO monitoring | 3-5h | 0.5h | 🟢 90% |
| Email marketing | 3-4h | 0.5h | 🟢 90% |
| Affiliate tracking | 2h | 0.5h | 🟢 75% |
| **TOTAL** | **30-41h/week** | **4.5-7.5h/week** | **🚀 83% reduction** |

---

## 1. Content Creation Automation (80% Automated)

### A. AI-Assisted Article Generation

**Tool Stack:**
- ChatGPT/Claude API (for bulk generation)
- Python script to auto-generate articles
- Auto-add to Notion database

#### Script: `scripts/generate_article.py`

```python
#!/usr/bin/env python3
"""
Auto-generate solar energy articles using OpenAI/Anthropic API
"""
import os
import requests
import json
from datetime import datetime

# Notion setup
NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DB_ID = os.environ.get("NOTION_DB_ID")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

NOTION_CREATE_URL = "https://api.notion.com/v1/pages"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

# Article templates with prompts
ARTICLE_TEMPLATES = [
    {
        "title": "Best Solar Starter Kits Under €{price} for {year}",
        "keyword": "best solar starter kits under {price}",
        "prompt": """Write a comprehensive 2000-word article about the best solar starter kits under €{price} for {year}.

Include:
- Introduction explaining benefits of solar starter kits
- 5 product recommendations with specs, pros/cons
- Comparison table
- Installation tips
- FAQ section (5 questions)
- Conclusion with call-to-action

Target audience: Finnish homeowners and cabin owners
Tone: Helpful, educational, not overly salesy
Include placeholder affiliate links: AFFILIATE_LINK_PRODUCT_NAME{{{{DEFAULT_UTM}}}}
""",
        "variables": {"price": 500, "year": 2025}
    },
    {
        "title": "How to Calculate Solar ROI in {country} ({year} Guide)",
        "keyword": "solar ROI calculator {country}",
        "prompt": """Write a detailed 1500-word guide on calculating solar panel return on investment in {country} for {year}.

Include:
- Step-by-step ROI calculation formula
- Example calculations with real numbers
- Factors affecting ROI in {country} (climate, electricity prices, subsidies)
- Interactive calculator explanation
- Common mistakes to avoid
- FAQ section

Use {country}-specific data and pricing in euros.
Helpful and practical tone.
""",
        "variables": {"country": "Finland", "year": 2025}
    },
    {
        "title": "{number} Common Mistakes When Buying Your First Solar Panel",
        "keyword": "solar panel buying mistakes",
        "prompt": """Write an engaging 1800-word article about {number} common mistakes people make when buying their first solar panel system.

For each mistake include:
- Real-world example
- Why it's a problem
- How to avoid it
- What to do instead

Mistakes to cover:
1. Not calculating actual energy needs
2. Choosing cheapest panels without checking quality
3. Ignoring warranty terms
4. Wrong placement/orientation
5. Not considering future expansion
6-7. [Add relevant mistakes]

Conversational tone, help beginners avoid costly errors.
""",
        "variables": {"number": 7}
    }
]

def generate_article_with_ai(prompt, max_tokens=3000):
    """Generate article content using OpenAI API"""
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4",  # or "gpt-3.5-turbo" for cheaper option
            "messages": [
                {"role": "system", "content": "You are an expert content writer specializing in solar energy and renewable technology. Write in a helpful, educational tone."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenAI API error: {response.text}")

def create_notion_page(title, slug, content, keyword):
    """Create a new page in Notion database"""

    # Generate meta description (first 155 chars of content)
    meta_description = content[:155].strip() + "..."

    payload = {
        "parent": {"database_id": NOTION_DB_ID},
        "properties": {
            "Title": {
                "title": [{"text": {"content": title}}]
            },
            "Slug": {
                "rich_text": [{"text": {"content": slug}}]
            },
            "Status": {
                "select": {"name": "Draft"}  # Set to Draft for review
            },
            "Keyword": {
                "rich_text": [{"text": {"content": keyword}}]
            },
            "Outline": {
                "rich_text": [{"text": {"content": meta_description}}]
            },
            "Notes": {
                "rich_text": [{"text": {"content": content}}]
            }
        }
    }

    response = requests.post(
        NOTION_CREATE_URL,
        headers=NOTION_HEADERS,
        data=json.dumps(payload)
    )

    if response.status_code == 200:
        return response.json()["id"]
    else:
        raise Exception(f"Notion API error: {response.text}")

def format_title(template, variables):
    """Replace variables in title template"""
    title = template
    for key, value in variables.items():
        title = title.replace(f"{{{key}}}", str(value))
    return title

def format_prompt(template, variables):
    """Replace variables in prompt template"""
    prompt = template
    for key, value in variables.items():
        prompt = prompt.replace(f"{{{key}}}", str(value))
    return prompt

def generate_slug(title):
    """Generate URL-friendly slug from title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:80]

def main():
    """Generate articles from templates and add to Notion"""

    print("🚀 Starting automated article generation...\n")

    for i, template in enumerate(ARTICLE_TEMPLATES, 1):
        print(f"📝 Generating article {i}/{len(ARTICLE_TEMPLATES)}...")

        # Format title and prompt with variables
        title = format_title(template["title"], template["variables"])
        prompt = format_prompt(template["prompt"], template["variables"])
        keyword = format_title(template["keyword"], template["variables"])
        slug = generate_slug(title)

        print(f"   Title: {title}")
        print(f"   Keyword: {keyword}")

        # Generate content with AI
        try:
            content = generate_article_with_ai(prompt)
            print(f"   ✅ Content generated ({len(content)} characters)")
        except Exception as e:
            print(f"   ❌ Error generating content: {e}")
            continue

        # Create Notion page
        try:
            page_id = create_notion_page(title, slug, content, keyword)
            print(f"   ✅ Added to Notion (ID: {page_id})\n")
        except Exception as e:
            print(f"   ❌ Error creating Notion page: {e}\n")
            continue

    print("🎉 Article generation complete!")
    print("📋 Check Notion database - articles are in 'Draft' status")
    print("👀 Review, edit, and set to 'Ready' to publish")

if __name__ == "__main__":
    main()
```

**Setup:**
```bash
# Install dependencies
pip install openai anthropic

# Set environment variables
export OPENAI_API_KEY="sk-..."
export NOTION_API_KEY="secret_..."
export NOTION_DB_ID="..."

# Generate 3 articles
python scripts/generate_article.py
```

**Cost:** ~$0.10-0.30 per article with GPT-4 (or $0.02-0.05 with GPT-3.5)

---

### B. Automated Content Calendar

#### Script: `scripts/schedule_content.py`

```python
#!/usr/bin/env python3
"""
Auto-generate content calendar and schedule articles
"""
import os
from datetime import datetime, timedelta
import requests
import json

NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DB_ID = os.environ.get("NOTION_DB_ID")

# Content calendar: topics to generate weekly
WEEKLY_TOPICS = [
    "Solar product review (specific model)",
    "How-to guide (installation, maintenance)",
    "Comparison article (2-3 products)",
    "News/trends in solar industry",
    "FAQ/troubleshooting article"
]

# Seasonal topics (Q4 focus)
Q4_TOPICS = [
    "Black Friday solar deals tracking",
    "Christmas gift guide: solar gadgets",
    "Year-end tax benefits for solar",
    "New Year energy savings challenge",
    "Winter solar panel performance"
]

def schedule_articles(weeks=4):
    """Generate content schedule for next N weeks"""

    schedule = []
    start_date = datetime.now()

    for week in range(weeks):
        week_start = start_date + timedelta(weeks=week)

        # Pick topics for this week (cycling through templates)
        week_topics = []
        for day in range(5):  # Mon-Fri
            topic_index = (week * 5 + day) % len(WEEKLY_TOPICS)
            topic = WEEKLY_TOPICS[topic_index]

            publish_date = week_start + timedelta(days=day)
            week_topics.append({
                "date": publish_date.strftime("%Y-%m-%d"),
                "topic": topic,
                "status": "Scheduled"
            })

        schedule.append({
            "week": week + 1,
            "start_date": week_start.strftime("%Y-%m-%d"),
            "topics": week_topics
        })

    return schedule

def create_scheduled_notion_pages(schedule):
    """Create placeholder pages in Notion for scheduled content"""

    for week_data in schedule:
        for topic_data in week_data["topics"]:
            title = f"[{topic_data['date']}] {topic_data['topic']}"

            # Create Notion page in "Backlog" status
            payload = {
                "parent": {"database_id": NOTION_DB_ID},
                "properties": {
                    "Title": {"title": [{"text": {"content": title}}]},
                    "Status": {"select": {"name": "Backlog"}},
                    "Notes": {
                        "rich_text": [{
                            "text": {
                                "content": f"Scheduled for {topic_data['date']}. Topic: {topic_data['topic']}"
                            }
                        }]
                    }
                }
            }

            # Send to Notion API
            # ... (same as previous script)
            print(f"📅 Scheduled: {title}")

def main():
    schedule = schedule_articles(weeks=4)

    print("📅 Content Calendar (Next 4 Weeks)\n")
    print("=" * 60)

    for week_data in schedule:
        print(f"\n🗓️  Week {week_data['week']} (Starting {week_data['start_date']})")
        print("-" * 60)
        for topic in week_data["topics"]:
            print(f"  {topic['date']}: {topic['topic']}")

    print("\n" + "=" * 60)
    print("\n💡 Tip: Run generate_article.py weekly to auto-create these articles")

    # Optionally create placeholder pages in Notion
    # create_scheduled_notion_pages(schedule)

if __name__ == "__main__":
    main()
```

---

## 2. Social Media Automation (85% Automated)

### A. Auto-Generate Social Posts from Articles

#### Script: `scripts/social_media_generator.py`

```python
#!/usr/bin/env python3
"""
Auto-generate social media posts from published articles
Creates Instagram captions, Pinterest descriptions, Twitter threads
"""
import os
import requests
from pathlib import Path
from bs4 import BeautifulSoup
import json

def extract_article_data(html_file):
    """Extract title, description, and key points from HTML article"""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    title = soup.find('h1').text if soup.find('h1') else "Solar Energy Tips"
    meta_desc = soup.find('meta', {'name': 'description'})
    description = meta_desc['content'] if meta_desc else ""

    # Extract first 3 bullet points or headings
    key_points = []
    for h2 in soup.find_all('h2')[:3]:
        key_points.append(h2.text)

    return {
        "title": title,
        "description": description,
        "key_points": key_points,
        "url": f"https://yoursite.com/{Path(html_file).name}"
    }

def generate_instagram_caption(article_data):
    """Generate Instagram caption with hashtags"""
    caption = f"""✨ {article_data['title']} ✨

{article_data['description'][:100]}...

Key takeaways:
"""

    for i, point in enumerate(article_data['key_points'], 1):
        caption += f"{i}. {point}\n"

    caption += f"""
🔗 Full guide in bio: {article_data['url']}

#solarenergy #renewableenergy #solarpanels #greenenergy #cleantech #sustainability #solarpower #ecofriendly #gogreen #energysavings #solarhome #renewables #climateaction #solarpv #greenliving
"""

    return caption

def generate_pinterest_description(article_data):
    """Generate Pinterest pin description (SEO-heavy)"""
    description = f"""{article_data['title']} | Complete Guide

{article_data['description']}

This pin covers:
"""

    for point in article_data['key_points']:
        description += f"• {point}\n"

    description += f"""
Perfect for homeowners looking to save money with solar energy!

Read full article: {article_data['url']}

Keywords: solar panels, solar energy, renewable energy, solar installation, solar power, green energy, sustainable living, solar panel guide, solar ROI
"""

    return description

def generate_twitter_thread(article_data):
    """Generate Twitter/X thread (multiple tweets)"""
    tweets = []

    # Tweet 1: Hook
    tweets.append(f"🌞 {article_data['title']}\n\nA thread 🧵👇")

    # Tweet 2-4: Key points
    for i, point in enumerate(article_data['key_points'], 2):
        tweets.append(f"{i-1}/ {point}\n\n#solarenergy #renewableenergy")

    # Final tweet: CTA
    tweets.append(f"Want to learn more?\n\n📖 Full guide: {article_data['url']}\n\n♻️ RT if you found this helpful!")

    return tweets

def generate_all_social_content(html_files):
    """Generate social media content for all articles"""

    all_content = []

    for html_file in html_files:
        article_data = extract_article_data(html_file)

        content = {
            "file": html_file,
            "title": article_data["title"],
            "instagram": generate_instagram_caption(article_data),
            "pinterest": generate_pinterest_description(article_data),
            "twitter": generate_twitter_thread(article_data)
        }

        all_content.append(content)

    return all_content

def save_to_csv(content_list, output_file="social_media_posts.csv"):
    """Save to CSV for easy import to Buffer/Hootsuite"""
    import csv

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Platform', 'Title', 'Content', 'URL'])

        for content in content_list:
            writer.writerow(['Instagram', content['title'], content['instagram'], ''])
            writer.writerow(['Pinterest', content['title'], content['pinterest'], ''])

            # Twitter thread as multiple rows
            for i, tweet in enumerate(content['twitter']):
                writer.writerow(['Twitter', f"{content['title']} (Tweet {i+1})", tweet, ''])

    print(f"✅ Saved to {output_file}")
    print(f"📤 Import to Buffer/Hootsuite for scheduling")

def main():
    # Get all HTML files in current directory
    html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html']

    print(f"📱 Generating social media content for {len(html_files)} articles...\n")

    content_list = generate_all_social_content(html_files)

    # Print preview
    for content in content_list[:1]:  # Show first one as example
        print("=" * 60)
        print(f"📄 Article: {content['title']}")
        print("=" * 60)
        print("\n📸 INSTAGRAM:")
        print(content['instagram'])
        print("\n📌 PINTEREST:")
        print(content['pinterest'])
        print("\n🐦 TWITTER THREAD:")
        for i, tweet in enumerate(content['twitter'], 1):
            print(f"\nTweet {i}:")
            print(tweet)
        print("\n")

    # Save all to CSV
    save_to_csv(content_list)

if __name__ == "__main__":
    main()
```

**Usage:**
```bash
python scripts/social_media_generator.py

# Output: social_media_posts.csv
# Import to Buffer.com or Hootsuite.com for scheduling
```

---

### B. Auto-Schedule Social Posts (Buffer API)

#### Script: `scripts/schedule_to_buffer.py`

```python
#!/usr/bin/env python3
"""
Auto-schedule posts to Buffer (requires Buffer API access)
"""
import os
import requests
import time
from datetime import datetime, timedelta

BUFFER_ACCESS_TOKEN = os.environ.get("BUFFER_ACCESS_TOKEN")
BUFFER_PROFILE_ID = os.environ.get("BUFFER_PROFILE_ID")  # Get from Buffer settings

def get_buffer_profiles():
    """Get your Buffer profiles (Instagram, Twitter, etc.)"""
    response = requests.get(
        "https://api.bufferapp.com/1/profiles.json",
        params={"access_token": BUFFER_ACCESS_TOKEN}
    )
    return response.json()

def schedule_post_to_buffer(profile_id, text, scheduled_time, media_url=None):
    """Schedule a post to Buffer"""

    payload = {
        "access_token": BUFFER_ACCESS_TOKEN,
        "profile_ids[]": profile_id,
        "text": text,
        "scheduled_at": scheduled_time.timestamp(),
        "shorten": True
    }

    if media_url:
        payload["media[photo]"] = media_url

    response = requests.post(
        "https://api.bufferapp.com/1/updates/create.json",
        data=payload
    )

    return response.json()

def auto_schedule_week(posts, start_date=None):
    """Schedule posts for the week (Mon-Fri, 9am, 2pm, 6pm)"""

    if not start_date:
        start_date = datetime.now()

    post_times = []
    for day in range(5):  # Mon-Fri
        base_date = start_date + timedelta(days=day)
        for hour in [9, 14, 18]:  # 9am, 2pm, 6pm
            post_times.append(base_date.replace(hour=hour, minute=0, second=0))

    for i, (post, scheduled_time) in enumerate(zip(posts, post_times)):
        print(f"📅 Scheduling post {i+1}/{len(posts)} for {scheduled_time}")

        try:
            result = schedule_post_to_buffer(
                BUFFER_PROFILE_ID,
                post['content'],
                scheduled_time
            )
            print(f"   ✅ Scheduled: {result.get('id', 'Success')}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(1)  # Rate limit protection

# ... rest of script
```

**Alternative: Use Zapier/Make.com (No Code)**

If you don't want to code:

1. **Zapier Flow:**
   ```
   GitHub (new file pushed) →
   Parse HTML →
   Generate caption (ChatGPT) →
   Schedule to Buffer/Hootsuite
   ```

2. **Make.com Scenario:**
   ```
   Watch GitHub repo →
   Extract article data →
   OpenAI: Generate captions →
   Instagram API: Schedule post
   ```

---

## 3. SEO Monitoring Automation (90% Automated)

### A. Auto-Check Rankings

#### Script: `scripts/monitor_rankings.py`

```python
#!/usr/bin/env python3
"""
Monitor Google rankings for target keywords
Uses SerpApi (free tier: 100 searches/month)
"""
import os
import requests
import json
from datetime import datetime

SERPAPI_KEY = os.environ.get("SERPAPI_KEY")
SITE_DOMAIN = os.environ.get("SITE_DOMAIN", "yoursite.com")

# Keywords to track
TARGET_KEYWORDS = [
    "parhaat aurinkopaneelisarjat kotiin 2025",
    "aurinkopaneeli parvekkeelle",
    "aurinkoenergia kannattavuus Suomi",
    "portaattivinen aurinkolaturi retkeilyyn",
    "aurinkopaneeli mökille"
]

def check_ranking(keyword, location="Finland"):
    """Check Google ranking for a keyword"""

    params = {
        "q": keyword,
        "location": location,
        "hl": "fi",
        "gl": "fi",
        "google_domain": "google.fi",
        "api_key": SERPAPI_KEY
    }

    response = requests.get("https://serpapi.com/search", params=params)
    results = response.json()

    # Find our site in results
    position = None
    for i, result in enumerate(results.get("organic_results", []), 1):
        if SITE_DOMAIN in result.get("link", ""):
            position = i
            break

    return {
        "keyword": keyword,
        "position": position if position else "Not in top 100",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "top_result": results["organic_results"][0]["link"] if results.get("organic_results") else None
    }

def monitor_all_keywords():
    """Check rankings for all target keywords"""

    rankings = []

    print("🔍 Checking rankings...\n")

    for keyword in TARGET_KEYWORDS:
        print(f"   Checking: {keyword}")
        ranking = check_ranking(keyword)
        rankings.append(ranking)

        if ranking["position"] != "Not in top 100":
            print(f"   ✅ Position: {ranking['position']}")
        else:
            print(f"   ❌ Not ranking in top 100")

        print(f"   🥇 Top result: {ranking['top_result']}\n")

    # Save to file for tracking
    with open('ranking_history.json', 'a') as f:
        f.write(json.dumps(rankings) + '\n')

    return rankings

def send_weekly_report(rankings):
    """Send rankings report via email (optional)"""
    # Use SendGrid, Mailgun, or similar
    pass

if __name__ == "__main__":
    rankings = monitor_all_keywords()

    print("📊 Ranking Summary:")
    print("=" * 60)
    for r in rankings:
        print(f"{r['keyword'][:40]:40} | Position: {r['position']}")
```

**Run weekly via cron:**
```bash
# Add to .github/workflows/monitor_seo.yml
name: Weekly SEO Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9am
jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check rankings
        env:
          SERPAPI_KEY: ${{ secrets.SERPAPI_KEY }}
          SITE_DOMAIN: ${{ secrets.SITE_BASE_URL }}
        run: python scripts/monitor_rankings.py
```

---

### B. Auto-Submit to Search Engines

```python
#!/usr/bin/env python3
"""
Auto-submit new URLs to Google Search Console via Indexing API
"""
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

def submit_url_to_google(url, service_account_file):
    """Submit URL to Google for indexing"""

    credentials = service_account.Credentials.from_service_account_file(
        service_account_file,
        scopes=['https://www.googleapis.com/auth/indexing']
    )

    service = build('indexing', 'v3', credentials=credentials)

    body = {
        "url": url,
        "type": "URL_UPDATED"
    }

    response = service.urlNotifications().publish(body=body).execute()
    return response

# Usage
submit_url_to_google(
    "https://yoursite.com/new-article.html",
    "google-service-account.json"
)
```

---

## 4. Email Marketing Automation (90% Automated)

### A. Auto-Welcome Sequence (ConvertKit/Mailchimp)

**Setup once, runs forever:**

1. **Create email sequence in ConvertKit:**
   - Email 1 (Day 0): "Welcome! Here's your Solar Energy Starter Guide"
   - Email 2 (Day 3): "Top 5 Solar Products Under €500"
   - Email 3 (Day 7): "How to Calculate Your Solar ROI"
   - Email 4 (Day 14): "Black Friday Solar Deals (members-only)"

2. **Auto-trigger on signup:**
   ```javascript
   // Add to your HTML pages
   <form action="https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions" method="post">
     <input name="email_address" placeholder="your@email.com" required>
     <button type="submit">Get Solar Tips</button>
   </form>
   ```

---

### B. Auto-Send New Articles to Subscribers

```python
#!/usr/bin/env python3
"""
Auto-send new articles to email list via ConvertKit API
"""
import os
import requests

CONVERTKIT_API_KEY = os.environ.get("CONVERTKIT_API_KEY")
CONVERTKIT_API_SECRET = os.environ.get("CONVERTKIT_API_SECRET")

def create_broadcast(subject, content, send_at=None):
    """Create and schedule email broadcast"""

    payload = {
        "api_secret": CONVERTKIT_API_SECRET,
        "subject": subject,
        "content": content,
        "description": "Auto-generated from new article",
        "public": False
    }

    if send_at:
        payload["send_at"] = send_at  # ISO 8601 format

    response = requests.post(
        f"https://api.convertkit.com/v3/broadcasts",
        json=payload
    )

    return response.json()

def send_new_article_email(article_title, article_url, article_excerpt):
    """Send email about new article to subscribers"""

    email_content = f"""
    <h2>New Article: {article_title}</h2>

    <p>{article_excerpt}</p>

    <p><a href="{article_url}">Read full article →</a></p>

    <hr>

    <p><small>You're receiving this because you subscribed to solar energy updates.
    <a href="{{{{ unsubscribe_url }}}}">Unsubscribe</a></small></p>
    """

    result = create_broadcast(
        subject=f"New: {article_title}",
        content=email_content
    )

    print(f"✅ Email scheduled: {result.get('id')}")

# Integrate with GitHub Actions workflow
```

---

## 5. Affiliate Link Management Automation

### A. Auto-Update Prices (Amazon API)

```python
#!/usr/bin/env python3
"""
Auto-fetch current prices from Amazon and update HTML files
Requires: Amazon Product Advertising API
"""
import os
import requests
from bs4 import BeautifulSoup
import re

def get_amazon_price(asin, amazon_tag):
    """Fetch current price for Amazon product (simplified)"""
    # Note: Real implementation requires Amazon PA API credentials
    # This is a simplified example

    url = f"https://www.amazon.de/dp/{asin}"
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Try to find price (Amazon changes selectors frequently)
    price_elem = soup.select_one('.a-price .a-offscreen')
    if price_elem:
        price_text = price_elem.text
        # Extract numeric value
        price = re.search(r'[\d,]+\.?\d*', price_text)
        return price.group(0) if price else "N/A"

    return "N/A"

def update_prices_in_html(html_file, asin_map):
    """Update prices in HTML file"""

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Find all affiliate links
    for link in soup.find_all('a', href=re.compile(r'amazon')):
        # Extract ASIN from URL
        asin_match = re.search(r'/dp/([A-Z0-9]{10})', link.get('href', ''))

        if asin_match:
            asin = asin_match.group(1)
            current_price = get_amazon_price(asin, "YOUR_TAG")

            # Update price in nearby text
            parent = link.parent
            price_pattern = r'€\d+[,.]?\d*'

            if parent:
                parent_text = parent.text
                new_text = re.sub(price_pattern, f'€{current_price}', parent_text)
                parent.string = new_text

            print(f"Updated {asin}: €{current_price}")

    # Write back
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(str(soup))

# Run weekly
```

---

### B. Auto-Check Broken Links

```python
#!/usr/bin/env python3
"""
Check all affiliate links are still working
"""
import os
import requests
from bs4 import BeautifulSoup
import re

def check_all_links(html_file):
    """Check if affiliate links are working"""

    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    broken_links = []

    for link in soup.find_all('a', href=True):
        url = link['href']

        # Skip internal links
        if not url.startswith('http'):
            continue

        try:
            response = requests.head(url, timeout=10, allow_redirects=True)

            if response.status_code >= 400:
                broken_links.append({
                    "url": url,
                    "status": response.status_code,
                    "text": link.text
                })
                print(f"❌ Broken: {url} (Status: {response.status_code})")
            else:
                print(f"✅ OK: {url}")

        except requests.RequestException as e:
            broken_links.append({
                "url": url,
                "error": str(e),
                "text": link.text
            })
            print(f"⚠️  Error checking {url}: {e}")

    return broken_links

# Run weekly via GitHub Actions
```

---

## 6. Complete Automation Workflow

### GitHub Actions: ``.github/workflows/full_automation.yml``

```yaml
name: Full Site Automation

on:
  schedule:
    # Run different tasks at different times
    - cron: '0 9 * * 1'    # Monday 9am: Generate weekly content
    - cron: '0 6,12,18 * * *'  # 3x daily: Publish from Notion
    - cron: '0 10 * * 1'   # Monday 10am: Check SEO rankings
    - cron: '0 14 * * 1'   # Monday 2pm: Check broken links

  workflow_dispatch:  # Allow manual trigger

jobs:

  # Job 1: Generate Content (Weekly)
  generate-content:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 9 * * 1'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install openai requests beautifulsoup4

      - name: Generate articles
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DB_ID: ${{ secrets.NOTION_DB_ID }}
        run: python scripts/generate_article.py

  # Job 2: Publish from Notion (3x daily)
  publish:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 6,12,18 * * *'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Publish articles
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DB_ID: ${{ secrets.NOTION_DB_ID }}
          SITE_BASE_URL: ${{ secrets.SITE_BASE_URL }}
          GA4_MEASUREMENT_ID: ${{ secrets.GA4_MEASUREMENT_ID }}
        run: python scripts/publish.py

      - name: Commit and push
        run: |
          git config user.name "automation-bot"
          git config user.email "bot@noreply.github.com"
          git add -A
          git commit -m "Auto-publish from Notion [skip ci]" || echo "No changes"
          git push

  # Job 3: Generate Social Media (After publishing)
  social-media:
    needs: publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Generate social posts
        run: |
          pip install beautifulsoup4
          python scripts/social_media_generator.py

      - name: Upload to Buffer (optional)
        env:
          BUFFER_ACCESS_TOKEN: ${{ secrets.BUFFER_ACCESS_TOKEN }}
        run: python scripts/schedule_to_buffer.py

  # Job 4: SEO Monitoring (Weekly)
  seo-check:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 10 * * 1'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5

      - name: Check rankings
        env:
          SERPAPI_KEY: ${{ secrets.SERPAPI_KEY }}
          SITE_DOMAIN: ${{ secrets.SITE_BASE_URL }}
        run: |
          pip install requests
          python scripts/monitor_rankings.py

      - name: Commit ranking history
        run: |
          git add ranking_history.json
          git commit -m "Update SEO rankings [skip ci]" || echo "No changes"
          git push

  # Job 5: Link Maintenance (Weekly)
  link-check:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 14 * * 1'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5

      - name: Check broken links
        run: |
          pip install requests beautifulsoup4
          python scripts/check_links.py
```

---

## 7. Cost Analysis

| Service | Free Tier | Paid (if needed) | Recommended |
|---------|-----------|------------------|-------------|
| **Hosting** | Cloudflare Pages | - | Free ✅ |
| **GitHub Actions** | 2000 min/month | $0.008/min | Free ✅ |
| **OpenAI (GPT-4)** | - | ~$0.20/article | €50/month |
| **OpenAI (GPT-3.5)** | - | ~$0.03/article | €10/month ✅ |
| **Notion** | Free | $10/month | Free ✅ |
| **Buffer** | 3 social accounts | $6/month | €6/month ✅ |
| **SerpApi** | 100 searches/month | $75/month | Free ✅ |
| **ConvertKit** | 1000 subscribers | $29/month | Free → Paid |
| **Google Analytics** | Free | - | Free ✅ |
| **Amazon Associates** | Free | - | Free ✅ |
| **Total** | **€0/month** | **€16-66/month** | **€16/month** ✅ |

**With €16/month you can automate 80-90% of operations.**

---

## 8. Time Savings Summary

### Before Automation:
- **Monday:** 6h (plan content, write 2 articles)
- **Tuesday:** 5h (social media, respond to comments)
- **Wednesday:** 4h (SEO research, optimize articles)
- **Thursday:** 5h (write article, email newsletter)
- **Friday:** 4h (analytics, link maintenance)
- **Weekend:** 6h (social media, content creation)
- **TOTAL: 30 hours/week**

### After Maximum Automation:
- **Monday:** 1h (review AI-generated articles, publish)
- **Tuesday:** 0.5h (check Buffer scheduled posts)
- **Wednesday:** 0.5h (review SEO report, make tweaks)
- **Thursday:** 0.5h (approve email newsletter)
- **Friday:** 0.5h (check analytics dashboard)
- **Weekend:** 1h (engage with comments, respond)
- **TOTAL: 4 hours/week**

**Time saved: 26 hours/week (87% reduction!)** 🎉

---

## 9. Setup Checklist

### Week 1: Foundation
- [ ] Set up all GitHub Secrets (API keys)
- [ ] Create Notion database with automation
- [ ] Deploy to Cloudflare Pages
- [ ] Set up Google Analytics

### Week 2: Content Automation
- [ ] Install OpenAI/Anthropic API
- [ ] Run `generate_article.py` to create 5 articles
- [ ] Review and edit AI content
- [ ] Publish via Notion automation

### Week 3: Social Media Automation
- [ ] Create Buffer/Hootsuite account
- [ ] Run `social_media_generator.py`
- [ ] Import CSV to Buffer
- [ ] Schedule 2 weeks of posts

### Week 4: Monitoring
- [ ] Set up SerpApi for ranking tracking
- [ ] Add SEO monitoring to GitHub Actions
- [ ] Set up ConvertKit email automation
- [ ] Test all workflows

---

## 10. Maintenance Routine (4 hours/week)

### Daily (15 min):
- [ ] Check Notion for AI-generated articles → approve/edit
- [ ] Review social media engagement (5 min)
- [ ] Quick scan of affiliate dashboard (5 min)

### Weekly (2 hours):
- [ ] Review SEO rankings report (15 min)
- [ ] Edit/improve AI-generated content (1 hour)
- [ ] Respond to comments/messages (30 min)
- [ ] Check broken links report (15 min)

### Monthly (2 hours):
- [ ] Analyze Google Analytics (30 min)
- [ ] Update affiliate links/prices (30 min)
- [ ] Plan next month's content calendar (30 min)
- [ ] Optimize top-performing articles (30 min)

---

## 🎯 Final Result

With this maximum automation setup:

**You spend: 4-5 hours/week**
**System generates: 3-5 articles/week, 15-20 social posts/week, automated emails**
**Cost: €16/month**
**Potential income: €500-5000/month** (after 6-12 months)

**ROI: 3000-30,000% on time invested! 🚀**

---

## Next Steps

1. **Start with basics:** Publishing automation (already done ✅)
2. **Add content generation:** Use `generate_article.py` next week
3. **Add social automation:** Use `social_media_generator.py` + Buffer
4. **Add monitoring:** SEO + link checking
5. **Scale:** Once working, create multiple niche sites!

**This is as automated as affiliate marketing can realistically get without sacrificing quality.** 💪
