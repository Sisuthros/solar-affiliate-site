#!/usr/bin/env python3
"""
Auto-generate social media posts from HTML articles
Creates ready-to-post captions for Instagram, Pinterest, and Twitter/X
"""
import os
import csv
from pathlib import Path
from bs4 import BeautifulSoup
import re


def extract_article_data(html_file):
    """Extract key information from HTML article"""

    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
    except Exception as e:
        print(f"Error reading {html_file}: {e}")
        return None

    # Extract title
    title_elem = soup.find('h1')
    title = title_elem.text.strip() if title_elem else Path(html_file).stem

    # Extract meta description
    meta_desc = soup.find('meta', {'name': 'description'})
    description = meta_desc.get('content', '').strip() if meta_desc else ""

    # Extract first 3 section headings
    key_points = []
    for h2 in soup.find_all('h2')[:3]:
        text = h2.text.strip()
        # Clean up common patterns
        text = re.sub(r'^[\d\.\)]+\s*', '', text)  # Remove "1.", "2)", etc.
        if text and len(text) > 5:  # Skip very short headings
            key_points.append(text)

    # Get site URL (you can customize this)
    site_base = os.environ.get('SITE_BASE_URL', 'https://yoursite.com')
    url = f"{site_base}/{Path(html_file).name}"

    return {
        "title": title,
        "description": description,
        "key_points": key_points,
        "url": url,
        "filename": html_file
    }


def generate_instagram_caption(data):
    """Generate Instagram caption with emojis and hashtags"""

    caption = f"✨ {data['title']} ✨\n\n"

    if data['description']:
        # Truncate description for Instagram (keep it snappy)
        desc = data['description'][:120]
        if len(data['description']) > 120:
            desc += "..."
        caption += f"{desc}\n\n"

    if data['key_points']:
        caption += "📋 Key points:\n"
        for i, point in enumerate(data['key_points'][:3], 1):
            # Truncate long points
            point_text = point[:60] + "..." if len(point) > 60 else point
            caption += f"{i}. {point_text}\n"
        caption += "\n"

    caption += f"🔗 Full guide: Link in bio\n"
    caption += f"🌐 {data['url']}\n\n"

    # Hashtags (Instagram allows 30, use most relevant)
    hashtags = [
        "#solarenergy", "#renewableenergy", "#solarpanels",
        "#greenenergy", "#cleantech", "#sustainability",
        "#solarpower", "#ecofriendly", "#gogreen",
        "#energysavings", "#solarhome", "#renewables",
        "#climateaction", "#solarpv", "#greenliving",
        "#solarlife", "#sustainableliving", "#cleanenergy",
        "#solar2025", "#energyindependence"
    ]

    caption += " ".join(hashtags[:15])  # Use 15 most relevant

    return caption


def generate_pinterest_description(data):
    """Generate Pinterest pin description (SEO-optimized)"""

    description = f"📌 {data['title']} | Complete 2025 Guide\n\n"

    if data['description']:
        description += f"{data['description']}\n\n"

    if data['key_points']:
        description += "This pin covers:\n"
        for point in data['key_points']:
            description += f"✓ {point}\n"
        description += "\n"

    description += "Perfect for homeowners looking to save money with solar energy! "
    description += "Learn about solar panels, installation tips, ROI calculation, and the best products for 2025.\n\n"

    description += f"📖 Read the full article: {data['url']}\n\n"

    # Pinterest SEO keywords
    description += "Keywords: solar panels, solar energy, renewable energy, solar installation, "
    description += "solar power, green energy, sustainable living, solar panel guide, solar ROI, "
    description += "home solar systems, clean energy, solar savings\n"

    return description


def generate_twitter_thread(data):
    """Generate Twitter/X thread (multiple tweets)"""

    tweets = []

    # Tweet 1: Hook (must be under 280 chars)
    hook = f"🌞 {data['title']}\n\nA helpful thread 🧵👇"
    if len(hook) > 280:
        # Shorten title if needed
        short_title = data['title'][:100] + "..."
        hook = f"🌞 {short_title}\n\nA helpful thread 🧵👇"
    tweets.append(hook)

    # Tweet 2: Context (from description)
    if data['description']:
        context = data['description'][:260]  # Leave room for numbering
        if len(data['description']) > 260:
            context += "..."
        tweets.append(f"1/ {context}\n\n#solarenergy #renewableenergy")

    # Tweets 3-5: Key points
    for i, point in enumerate(data['key_points'][:3], 2):
        tweet_text = f"{i}/ {point}"

        # Truncate if too long
        if len(tweet_text) > 250:
            tweet_text = tweet_text[:247] + "..."

        tweet_text += "\n\n#solar #greenenergy"
        tweets.append(tweet_text)

    # Final tweet: CTA
    final_tweet = f"Want the full guide?\n\n📖 Read here: {data['url']}\n\n"
    final_tweet += "♻️ Retweet if you found this helpful!\n"
    final_tweet += "💬 Have questions? Drop them below!"
    tweets.append(final_tweet)

    return tweets


def generate_facebook_post(data):
    """Generate Facebook post (more casual, longer form allowed)"""

    post = f"🌞 {data['title']}\n\n"

    if data['description']:
        post += f"{data['description']}\n\n"

    if data['key_points']:
        post += "Here's what you'll learn:\n\n"
        for i, point in enumerate(data['key_points'], 1):
            post += f"✓ {point}\n"
        post += "\n"

    post += f"Read the complete guide here:\n{data['url']}\n\n"

    # Facebook hashtags (fewer than Instagram)
    post += "#SolarEnergy #RenewableEnergy #GoGreen #SolarPanels #SustainableLiving"

    return post


def save_to_csv(all_content, output_file="social_media_posts.csv"):
    """Save all social posts to CSV for import to Buffer/Hootsuite"""

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        # Header row
        writer.writerow(['Platform', 'Article', 'Post Number', 'Content', 'URL'])

        for content in all_content:
            article_name = Path(content['filename']).stem

            # Instagram
            writer.writerow([
                'Instagram',
                article_name,
                '1',
                content['instagram'],
                content['url']
            ])

            # Pinterest
            writer.writerow([
                'Pinterest',
                article_name,
                '1',
                content['pinterest'],
                content['url']
            ])

            # Facebook
            writer.writerow([
                'Facebook',
                article_name,
                '1',
                content['facebook'],
                content['url']
            ])

            # Twitter thread (multiple rows)
            for i, tweet in enumerate(content['twitter'], 1):
                writer.writerow([
                    'Twitter',
                    article_name,
                    str(i),
                    tweet,
                    content['url'] if i == len(content['twitter']) else ''
                ])

    print(f"\n✅ Social media posts saved to: {output_file}")
    print(f"📊 Total posts: {len(all_content) * 3 + sum(len(c['twitter']) for c in all_content)}")


def main():
    """Generate social media content for all HTML articles"""

    print("📱 Social Media Post Generator")
    print("=" * 70)
    print()

    # Find all HTML files (exclude index.html)
    html_files = [
        f for f in os.listdir('.')
        if f.endswith('.html') and f != 'index.html'
    ]

    if not html_files:
        print("❌ No HTML files found in current directory")
        print("Run this script from the repository root where HTML files are located")
        return

    print(f"Found {len(html_files)} article(s) to process\n")

    all_content = []

    for html_file in html_files:
        print(f"📄 Processing: {html_file}")

        # Extract data
        data = extract_article_data(html_file)

        if not data:
            print(f"   ⚠️  Skipped (error reading file)\n")
            continue

        # Generate all social content
        content = {
            'filename': html_file,
            'title': data['title'],
            'url': data['url'],
            'instagram': generate_instagram_caption(data),
            'pinterest': generate_pinterest_description(data),
            'twitter': generate_twitter_thread(data),
            'facebook': generate_facebook_post(data)
        }

        all_content.append(content)
        print(f"   ✅ Generated posts for all platforms\n")

    if not all_content:
        print("❌ No content generated")
        return

    # Show preview of first article
    print("\n" + "=" * 70)
    print("📋 PREVIEW: First Article's Social Posts")
    print("=" * 70)

    preview = all_content[0]

    print(f"\n📄 Article: {preview['title']}")
    print(f"🔗 URL: {preview['url']}\n")

    print("-" * 70)
    print("📸 INSTAGRAM CAPTION:")
    print("-" * 70)
    print(preview['instagram'])

    print("\n" + "-" * 70)
    print("📌 PINTEREST DESCRIPTION:")
    print("-" * 70)
    print(preview['pinterest'][:300] + "..." if len(preview['pinterest']) > 300 else preview['pinterest'])

    print("\n" + "-" * 70)
    print("🐦 TWITTER/X THREAD:")
    print("-" * 70)
    for i, tweet in enumerate(preview['twitter'], 1):
        print(f"\nTweet {i}/{len(preview['twitter'])}:")
        print(tweet)

    print("\n" + "-" * 70)
    print("📘 FACEBOOK POST:")
    print("-" * 70)
    print(preview['facebook'][:300] + "..." if len(preview['facebook']) > 300 else preview['facebook'])

    # Save to CSV
    print("\n" + "=" * 70)
    save_to_csv(all_content)

    print()
    print("📤 Next Steps:")
    print("1. Import social_media_posts.csv to Buffer/Hootsuite/Later")
    print("2. Schedule posts (recommended: 3x/week per platform)")
    print("3. Engage with comments daily (5-10 minutes)")
    print()
    print("💡 Tip: Mix automated posts with personal stories for best engagement")


if __name__ == "__main__":
    main()
