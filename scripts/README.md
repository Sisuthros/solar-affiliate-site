# Automation Scripts

This folder contains Python scripts for automating various aspects of running the affiliate site.

## Available Scripts

### 1. `publish.py` ✅ (Already Running)
**Status:** Production-ready, runs 3x daily via GitHub Actions

**Purpose:** Automated publishing from Notion to HTML files

**What it does:**
- Queries Notion database for articles with Status = "Ready"
- Renders HTML files using Jinja2 template
- Updates Notion status to "Published"
- Generates sitemap.xml and robots.txt
- Commits and pushes to GitHub

**Usage:**
```bash
export NOTION_API_KEY="secret_..."
export NOTION_DB_ID="..."
export SITE_BASE_URL="https://yoursite.com"
export GA4_MEASUREMENT_ID="G-XXXXXXXXXX"

python scripts/publish.py
```

**Automation:** Already configured in `.github/workflows/publish.yml`

---

### 2. `generate_article.py` 🆕 (AI Content Generation)
**Status:** Ready to use (requires OpenAI API key)

**Purpose:** AI-powered article generation using GPT-3.5/GPT-4

**What it does:**
- Uses predefined article templates
- Generates 1500-2000 word articles via OpenAI API
- Creates articles about solar energy, ROI calculations, common mistakes, etc.
- Automatically adds to Notion database as "Draft"
- Saves backup .txt files locally

**Setup:**
```bash
# Install dependencies
pip install openai

# Get API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY="sk-..."

# Optional: Notion integration
export NOTION_API_KEY="secret_..."
export NOTION_DB_ID="..."
```

**Usage:**
```bash
# Generate 3 articles from templates
python scripts/generate_article.py

# Articles will be:
# 1. Created as .txt backup files
# 2. Added to Notion as "Draft" (if credentials set)
# 3. Ready for manual review and editing
```

**Cost:** ~€0.03-0.05 per article (GPT-3.5) or €0.10-0.30 (GPT-4)

**Templates included:**
- "Best Solar Starter Kits Under €500 for 2025"
- "How to Calculate Solar Panel ROI in Finland"
- "7 Common Mistakes When Buying Your First Solar Panel"

**Customization:**
Edit `ARTICLE_TEMPLATES` list in the script to add your own article ideas.

---

### 3. `social_media_generator.py` 🆕 (Social Media Automation)
**Status:** Ready to use (no API keys needed)

**Purpose:** Generate social media posts from existing HTML articles

**What it does:**
- Reads all HTML articles in the repository
- Extracts title, description, and key points
- Generates optimized captions for:
  - Instagram (with hashtags)
  - Pinterest (SEO-optimized)
  - Twitter/X (multi-tweet threads)
  - Facebook (longer-form posts)
- Exports to CSV file for easy import to Buffer/Hootsuite

**Setup:**
```bash
pip install beautifulsoup4
```

**Usage:**
```bash
# Run from repository root
cd /path/to/solar-affiliate-site
python scripts/social_media_generator.py

# Output: social_media_posts.csv
```

**What to do with output:**
1. Open social_media_posts.csv
2. Import to Buffer.com or Hootsuite.com
3. Schedule posts (recommended: 3x/week per platform)

**Example output:**
- 1 Instagram post per article
- 1 Pinterest description per article
- 5-7 tweet thread per article
- 1 Facebook post per article

---

## 🔧 Setup Guide

### Prerequisites

```bash
# Install Python dependencies
pip install -r ../requirements.txt
pip install openai beautifulsoup4

# Optional for advanced features
pip install google-api-python-client  # For Google APIs
```

### Environment Variables

Create a `.env` file or export these variables:

```bash
# Required for publish.py (already configured in GitHub Secrets)
export NOTION_API_KEY="secret_..."
export NOTION_DB_ID="..."
export SITE_BASE_URL="https://yoursite.com"
export GA4_MEASUREMENT_ID="G-XXXXXXXXXX"

# Required for generate_article.py
export OPENAI_API_KEY="sk-..."

# Optional for advanced automation
export BUFFER_ACCESS_TOKEN="..."  # For Buffer API
export SERPAPI_KEY="..."          # For SEO ranking checks
export CONVERTKIT_API_KEY="..."   # For email automation
```

---

## 📅 Recommended Automation Schedule

### Daily (Automated via GitHub Actions)
- **06:00, 12:00, 18:00 Helsinki time:** Run `publish.py` (already configured)

### Weekly (Manual or automated)
- **Monday 9am:** Run `generate_article.py` to create 3 new articles
- **Monday 10am:** Review AI-generated articles in Notion, edit as needed
- **Monday 11am:** Set reviewed articles to "Ready" status
- **Tuesday 2pm:** Run `social_media_generator.py` to create social posts
- **Tuesday 3pm:** Import CSV to Buffer and schedule for the week

### Monthly (Manual)
- Review Google Analytics
- Update affiliate link prices
- Check for broken links
- Optimize top-performing articles

---

## 💡 Usage Tips

### Content Generation Workflow:

```bash
# Step 1: Generate articles (AI)
python scripts/generate_article.py
# Output: 3 .txt files + 3 Notion drafts

# Step 2: Review and edit in Notion
# - Check facts and accuracy
# - Add personal touches
# - Insert affiliate links
# - Set Status: "Ready"

# Step 3: Publish (automatic)
# GitHub Actions runs publish.py 3x daily
# Articles with "Ready" status → Published

# Step 4: Generate social posts
python scripts/social_media_generator.py
# Output: social_media_posts.csv

# Step 5: Schedule on social media
# Import CSV to Buffer/Hootsuite
```

### Customizing Article Templates:

Edit `generate_article.py` and modify `ARTICLE_TEMPLATES`:

```python
ARTICLE_TEMPLATES.append({
    "title": "Your Custom Title Here",
    "keyword": "target SEO keyword",
    "prompt": """
    Your detailed prompt for AI here.

    Be specific about:
    - Target word count
    - Sections to include
    - Tone and style
    - Target audience
    - Format (HTML tags)
    """
})
```

---

## 🚨 Common Issues & Solutions

### Issue: "OPENAI_API_KEY not set"
**Solution:**
```bash
export OPENAI_API_KEY="sk-..."
# Or add to .env file
```

### Issue: "Notion API error: 404"
**Solution:**
- Check that `NOTION_DB_ID` is correct
- Verify database is shared with your integration
- Follow: ../NOTION_SETUP.md

### Issue: Social media generator creates empty posts
**Solution:**
- Ensure HTML files have `<h1>` tags (title)
- Check that meta descriptions are present
- Run from repository root, not scripts/ folder

### Issue: AI generates low-quality content
**Solution:**
- Use GPT-4 instead of GPT-3.5 (better quality, higher cost)
- Make prompts more specific and detailed
- Always manually review and edit AI content before publishing

---

## 📊 Cost Breakdown

| Script | Dependencies | Cost/Month | Notes |
|--------|-------------|------------|-------|
| `publish.py` | None | €0 | GitHub Actions free tier |
| `generate_article.py` | OpenAI API | €10-50 | €0.03-0.30 per article |
| `social_media_generator.py` | None | €0 | Local processing |

**Recommended budget:** €10-20/month for AI content generation

---

## 🎯 Next Scripts to Add (Future)

Potential automation scripts you could add:

1. `monitor_rankings.py` - Track Google rankings weekly
2. `check_broken_links.py` - Find and fix broken affiliate links
3. `update_prices.py` - Auto-fetch current Amazon prices
4. `email_newsletter.py` - Auto-send new articles to email list
5. `analytics_report.py` - Weekly traffic/revenue summary

See `../MAXIMUM_AUTOMATION.md` for detailed examples of these scripts.

---

## 📚 Resources

- **OpenAI API Docs:** https://platform.openai.com/docs
- **Notion API Docs:** https://developers.notion.com/
- **Buffer API Docs:** https://buffer.com/developers/api
- **BeautifulSoup Docs:** https://www.crummy.com/software/BeautifulSoup/

---

## 💬 Support

For issues or questions:
1. Check the main documentation in repository root
2. Read `MAXIMUM_AUTOMATION.md` for advanced setups
3. Review `QUICK_START.md` for basic setup

**Remember:** These scripts are tools to ASSIST you, not replace you entirely. Always review AI-generated content for accuracy, add personal insights, and maintain quality standards.

Happy automating! 🚀
