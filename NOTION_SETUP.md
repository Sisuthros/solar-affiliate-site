# Notion Database Setup Guide

This guide will help you set up your Notion database to work with the automated publishing workflow.

## Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Give it a name (e.g., "Solar Affiliate Publisher")
4. Select the workspace where you'll create your content database
5. Click **"Submit"**
6. **Copy the "Internal Integration Token"** - this is your `NOTION_API_KEY`

## Step 2: Create Content Database

1. Create a new page in Notion
2. Type `/database` and select **"Table - Inline"**
3. Name it something like "Solar Content Pipeline"

## Step 3: Add Required Properties

Your database needs these exact property names (case-sensitive):

| Property Name | Type | Required | Description |
|---------------|------|----------|-------------|
| `Title` | Title | ✅ Yes | The article title (will be used as `<h1>` and `<title>`) |
| `Slug` | Text | ⚠️ Recommended | URL-friendly version (e.g., "solar-starter-kits"). If empty, will auto-generate from Title |
| `Status` | Select | ✅ Yes | Must have options: "Backlog", "Draft", "Ready", "Published" |
| `Outline` | Text | ⚠️ Recommended | Brief description (used as meta description, max 155 chars) |
| `Notes` | Text | ✅ Yes | The actual HTML content of your article |
| `Publish URL` | URL | No | Auto-filled by the script after publishing |
| `Keyword` | Text | No | Target SEO keyword (for your reference) |
| `Primary Affiliate` | Text | No | Main affiliate product in this article |
| `CTR / Conv` | Text | No | Track click-through rate / conversion rate |

### Creating the Status Property

1. Click on the **"Status"** column header
2. Select **"Edit property"**
3. Add these exact options:
   - Backlog
   - Draft
   - Ready
   - Published

## Step 4: Share Database with Integration

1. Open your content database in Notion
2. Click the **"•••"** (three dots) in the top-right corner
3. Select **"Add connections"**
4. Find and select your integration (e.g., "Solar Affiliate Publisher")
5. Click **"Confirm"**

## Step 5: Get Database ID

Your database ID is in the URL when you open the database:

```
https://www.notion.so/workspace/DATABASE_ID?v=...
                                 ^^^^^^^^^^^^
                                 Copy this part
```

Example:
- URL: `https://www.notion.so/myspace/a1b2c3d4e5f67890?v=xyz123`
- Database ID: `a1b2c3d4e5f67890`

## Step 6: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `NOTION_API_KEY` | Your integration token from Step 1 | ✅ Yes |
| `NOTION_DB_ID` | Your database ID from Step 5 | ✅ Yes |
| `SITE_BASE_URL` | Your site URL (e.g., `https://yoursite.com`) | ⚠️ Recommended |
| `GA4_MEASUREMENT_ID` | Your Google Analytics 4 ID (e.g., `G-XXXXXXXXXX`) | No |

**Note:** If you don't add `SITE_BASE_URL`, the script won't generate sitemap.xml or robots.txt.

## Step 7: Test the Workflow

### Option A: Manual Test (Recommended First Time)

1. Add a test row to your Notion database:
   - **Title:** "Test Article"
   - **Slug:** "test-article"
   - **Status:** "Ready"
   - **Outline:** "This is a test article to verify the publishing workflow."
   - **Notes:** `<p>This is the content of my test article.</p>`

2. Go to your GitHub repo → **Actions** tab
3. Click on **"Publish from Notion"** workflow
4. Click **"Run workflow"** → **"Run workflow"** button
5. Wait for the workflow to complete (~30 seconds)
6. Check your repo - you should see a new file: `test-article.html`
7. Check your Notion database - the Status should now be "Published"

### Option B: Automated Schedule

The workflow runs automatically 3 times daily:
- 09:00 Asia/Nicosia (UTC+3)
- 15:00 Asia/Nicosia (UTC+3)
- 21:00 Asia/Nicosia (UTC+3)

Just set articles to "Ready" status and wait for the next scheduled run.

## Content Workflow Best Practices

### 1. Backlog → Draft → Ready → Published

- **Backlog:** Ideas, not yet written
- **Draft:** Currently writing, not ready for review
- **Ready:** Complete and ready to publish (script will pick this up!)
- **Published:** Already published (script updates this automatically)

### 2. Writing Content in the Notes Field

You can write HTML directly, or use this template:

```html
<p>Introduction paragraph here.</p>

<h2>Main Section Heading</h2>
<p>Content for this section.</p>

<h3>Subsection</h3>
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>

<h2>Product Comparison</h2>
<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Rating</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="AFFILIATE_LINK_PRODUCT_A{{DEFAULT_UTM}}">Product A</a></td>
      <td>€199</td>
      <td>4.5/5</td>
    </tr>
  </tbody>
</table>

<h2>FAQ</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Is solar energy worth it in 2025?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Yes, solar energy continues to be a great investment in 2025...</p>
    </div>
  </div>
</div>
```

### 3. Using Affiliate Link Placeholders

Use placeholders like `AFFILIATE_LINK_PRODUCT_NAME{{DEFAULT_UTM}}` in your content.

Later, do a find-and-replace:
- Find: `AFFILIATE_LINK_PRODUCT_NAME{{DEFAULT_UTM}}`
- Replace: `https://amazon.com/dp/B0XYZ?tag=YOUR_TAG&utm_source=blog&utm_medium=article&utm_campaign=solar2025`

## Troubleshooting

### "No pages in Ready status" message
- Check that you have rows with Status exactly set to "Ready"
- Make sure the database is shared with your integration (Step 4)

### "Notion API key or database ID not set"
- Verify GitHub Secrets are correctly named and filled (Step 6)
- Re-run the workflow after adding secrets

### HTML file created but Status not updated
- Check that "Status" and "Publish URL" properties exist in your database
- Verify property names are exact (case-sensitive)

### Script runs but no commit
- If no pages have "Ready" status, the script won't commit anything
- Check the Actions log for "No pages in Ready status" or "No changes" messages

## Advanced: Local Testing

To test the script locally before pushing:

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export NOTION_API_KEY="your_key_here"
export NOTION_DB_ID="your_db_id_here"
export SITE_BASE_URL="https://yoursite.com"
export GA4_MEASUREMENT_ID="G-XXXXXXXXXX"

# Run the script
python scripts/publish.py
```

## Next Steps

Once your automation is working:
1. Create content in bulk and set Status to "Draft"
2. Review and move to "Ready" when articles are complete
3. Let the automation publish 3x daily
4. Monitor your Notion database for published URLs
5. Track performance using the "CTR / Conv" field

Happy publishing! 🚀
