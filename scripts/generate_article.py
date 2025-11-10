#!/usr/bin/env python3
"""
Auto-generate solar energy articles using OpenAI API and add to Notion
"""
import os
import requests
import json
import re
from datetime import datetime

# Configuration
NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DB_ID = os.environ.get("NOTION_DB_ID")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

NOTION_CREATE_URL = "https://api.notion.com/v1/pages"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

# Article templates
ARTICLE_TEMPLATES = [
    {
        "title": "Best Solar Starter Kits Under €500 for 2025",
        "keyword": "best solar starter kits under 500",
        "prompt": """Write a comprehensive 2000-word article about the best solar starter kits under €500 for 2025.

Include:
- Introduction explaining benefits of solar starter kits for homeowners and cabin owners
- 5 product recommendations with detailed specs, pros/cons, and ideal use cases
- Comparison table showing wattage, price, portability, and warranty
- Installation and setup tips for beginners
- FAQ section with 5 common questions about solar starter kits
- Conclusion with clear call-to-action

Target audience: Finnish homeowners, cabin owners, and eco-conscious consumers
Tone: Helpful, educational, practical (not overly sales-y)
Format: Use HTML tags (<h2>, <h3>, <p>, <ul>, <table>)
Include placeholder affiliate links in this format: AFFILIATE_LINK_PRODUCT_NAME{{DEFAULT_UTM}}

Make it practical and actionable."""
    },
    {
        "title": "How to Calculate Solar Panel ROI in Finland (2025 Guide)",
        "keyword": "solar ROI calculator Finland",
        "prompt": """Write a detailed 1500-word guide on calculating solar panel return on investment specifically for Finland in 2025.

Include:
- Introduction explaining why ROI matters for solar investments
- Step-by-step ROI calculation formula with real Finnish examples
- Example calculation: €5000 system with Finnish electricity prices
- Factors affecting ROI in Finland: climate, electricity prices, government subsidies, seasonal variation
- Comparison of different system sizes (3kW, 5kW, 10kW)
- Interactive calculator explanation
- Common mistakes to avoid when calculating ROI
- FAQ section with 5 questions

Use Finland-specific data:
- Average electricity price: €0.20-0.30/kWh
- Average solar hours: 1000-1200 hours/year
- Government subsidies: mention current Finnish solar grants

Tone: Informative, data-driven, practical
Format: HTML with tables and examples
Target: Finnish homeowners considering solar investment"""
    },
    {
        "title": "7 Common Mistakes When Buying Your First Solar Panel System",
        "keyword": "solar panel buying mistakes",
        "prompt": """Write an engaging 1800-word article about 7 critical mistakes people make when buying their first solar panel system.

For each mistake include:
1. Real-world example of the mistake
2. Why it's a problem (consequences)
3. How to avoid it
4. What to do instead (actionable advice)

Mistakes to cover:
1. Not calculating actual energy needs first
2. Choosing cheapest panels without checking quality/warranty
3. Ignoring inverter quality (focusing only on panels)
4. Wrong placement/orientation reducing efficiency
5. Not planning for future expansion
6. Skipping professional installation to save money
7. Not understanding net metering and grid connection rules

Include:
- Introduction with hook about costly mistakes
- Each mistake as separate section with <h2> heading
- Practical checklist at the end
- FAQ section with 5 questions
- Conclusion with clear next steps

Tone: Conversational, helpful, slightly cautionary (but not fear-mongering)
Format: HTML with clear structure
Target: First-time solar buyers who want to avoid expensive mistakes"""
    }
]


def generate_article_with_ai(prompt, max_tokens=3000):
    """Generate article content using OpenAI API"""

    if not OPENAI_API_KEY:
        raise Exception("OPENAI_API_KEY not set")

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-3.5-turbo",  # Use gpt-4 for better quality (more expensive)
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert content writer specializing in solar energy and renewable technology. Write informative, well-structured articles with HTML formatting. Focus on practical advice for homeowners in Finland and Nordic countries."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")


def create_notion_page(title, slug, content, keyword):
    """Create a new page in Notion database"""

    if not NOTION_API_KEY or not NOTION_DB_ID:
        raise Exception("NOTION_API_KEY or NOTION_DB_ID not set")

    # Generate meta description (first 155 chars)
    # Remove HTML tags for meta description
    clean_content = re.sub(r'<[^>]+>', '', content)
    meta_description = clean_content[:155].strip() + "..."

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
                "select": {"name": "Draft"}  # Set to Draft for manual review
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
        raise Exception(f"Notion API error: {response.status_code} - {response.text}")


def generate_slug(title):
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special chars
    slug = re.sub(r'[-\s]+', '-', slug)   # Replace spaces with hyphens
    slug = slug.strip('-')
    return slug[:80]  # Max 80 chars


def main():
    """Generate articles from templates and add to Notion"""

    print("🚀 Starting AI-powered article generation...\n")
    print("=" * 70)

    if not OPENAI_API_KEY:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("\nSet it with:")
        print("  export OPENAI_API_KEY='sk-...'")
        return

    if not NOTION_API_KEY or not NOTION_DB_ID:
        print("⚠️  WARNING: Notion credentials not set")
        print("Articles will be generated but not added to Notion")
        print("\nTo enable Notion integration:")
        print("  export NOTION_API_KEY='secret_...'")
        print("  export NOTION_DB_ID='...'")
        print()

    for i, template in enumerate(ARTICLE_TEMPLATES, 1):
        print(f"\n📝 Article {i}/{len(ARTICLE_TEMPLATES)}")
        print("-" * 70)

        title = template["title"]
        keyword = template["keyword"]
        slug = generate_slug(title)

        print(f"Title:   {title}")
        print(f"Keyword: {keyword}")
        print(f"Slug:    {slug}")
        print()

        # Generate content with AI
        try:
            print("⏳ Generating content with OpenAI...")
            content = generate_article_with_ai(template["prompt"])
            word_count = len(content.split())
            print(f"✅ Content generated: {word_count} words ({len(content)} characters)")
        except Exception as e:
            print(f"❌ Error generating content: {e}")
            continue

        # Save to file (backup)
        filename = f"{slug}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"Title: {title}\n")
            f.write(f"Keyword: {keyword}\n")
            f.write(f"Slug: {slug}\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 70 + "\n\n")
            f.write(content)
        print(f"💾 Saved backup to: {filename}")

        # Create Notion page
        if NOTION_API_KEY and NOTION_DB_ID:
            try:
                page_id = create_notion_page(title, slug, content, keyword)
                print(f"✅ Added to Notion database (Page ID: {page_id})")
                print("   Status: Draft (review and set to 'Ready' to publish)")
            except Exception as e:
                print(f"❌ Error creating Notion page: {e}")
        else:
            print("⏭️  Skipped Notion (credentials not set)")

    print("\n" + "=" * 70)
    print("🎉 Article generation complete!")
    print()
    print("Next steps:")
    print("1. Review generated articles (check .txt files)")
    print("2. If using Notion: Log in and review Draft articles")
    print("3. Edit as needed (add personal touches, verify facts)")
    print("4. Change Status to 'Ready' to publish via automation")
    print()
    print("💡 Tip: Run this script weekly to maintain content flow")


if __name__ == "__main__":
    main()
