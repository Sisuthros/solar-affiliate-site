# Solar & Clean-Energy Affiliate Engine — Starter Package

This folder contains three ready-to-publish HTML articles for your new **Solar & Clean-Energy** affiliate site. They are the first pieces of content for a WordPress blog or other CMS.

## Files

| File | Description |
|----|----|
| `home_solar_starter_kits_under_500_2025.html` | Comparison guide for solar starter kits under €500 (2025).|
| `solar_roi_calculator_2025.html` | Article with an interactive Solar ROI calculator (JavaScript).|
| `top_5_smart_energy_monitors_for_solar_2025.html` | Review of smart energy monitors for solar integration.|

The HTML files already include headings, meta descriptions, tables, lists, and FAQ schema. They also contain **affiliate link placeholders** like `AFFILIATE_LINK_STARTER_A{{DEFAULT_UTM}}`. Replace these placeholders with your actual affiliate URLs and the `DEFAULT_UTM` string you plan to use for tracking.

## How to publish on WordPress

1. **Create categories and tags:**
   - Categories: `Solar Basics`, `Installation Guides`, `Clean Energy Tech`, `Product Reviews`, `Regional Insights`.
   - Tags: `solar panel kits`, `home battery`, `inverter`, `off-grid`, `energy monitor`, `ROI calculator`.

2. **Import or paste the HTML:**
   - Log into your WordPress dashboard.
   - Go to **Posts → Add New**.
   - Click on the **Code editor** view (or “Text” tab) and paste the contents of the corresponding HTML file.
   - Assign the appropriate category and tags.
   - Add your Yoast/SEO meta description if needed (a meta description is already included in the `<head>` tag).
   - Publish the post.

3. **Replace affiliate placeholders:**
   - Find each `AFFILIATE_LINK_*` placeholder in the HTML.
   - Replace with the correct affiliate URL. For example:
     ```html
     <a href="https://amazon.com/dp/B0XYZ…?tag=YOURTAG&utm_source=affiliate&utm_medium=blog">Check current price</a>
     ```
   - Ensure your `DEFAULT_UTM` parameters match your analytics setup.

4. **Add disclosure block:**
   - A disclosure is already included at the top of each article. You may customize it as needed to comply with your local affiliate disclosure regulations.

## Optional: Notion Editorial Queue

If you plan to track ideas and drafts in Notion, create a database with fields such as:

- **Title**, **Slug**, **Keyword**, **Search Intent**, **Outline**, **Status** (Backlog, Draft, Ready, Published), **Primary Affiliate**, **Money Angle**, **Region**, **Product Type**, **Publish URL**, **CTR / Conv**, **Notes**.

Use this table to manage your content pipeline. Once you publish an article, update its status to `Published` and record the live URL.

## Next Steps

- Integrate GA4 and Bitly if you wish to track affiliate clicks.
- Schedule regular content generation (e.g. 3 posts/day) using an automation tool or by creating a simple script that posts at set times.
- Consider expanding the site to regional niches (e.g. `Solar in Cyprus` or `Solar in Greece`) and adding video content later.

## Support

If you have any questions about how to adapt these HTML files or need help with automation, feel free to ask.
