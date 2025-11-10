# Affiliate Links Replacement Guide

This guide will help you replace placeholder affiliate links in your HTML files with real affiliate URLs.

## Understanding the Placeholder Format

In the HTML files, you'll see placeholders like:

```html
<a href="AFFILIATE_LINK_PRODUCT_NAME{{DEFAULT_UTM}}">Product Name</a>
```

**Format breakdown:**
- `AFFILIATE_LINK_PRODUCT_NAME` - Unique identifier for each product
- `{{DEFAULT_UTM}}` - Placeholder for UTM tracking parameters

## Step 1: Join Affiliate Programs

Before you can add links, you need to join relevant affiliate programs:

### Recommended Programs for Solar/Clean Energy:

1. **Amazon Associates** (EU/Finland)
   - URL: https://affiliate-program.amazon.com/
   - Commission: 1-10% (electronics typically 3-5%)
   - Cookie duration: 24 hours
   - Best for: Solar kits, energy monitors, portable chargers

2. **Awin** (Europe)
   - URL: https://www.awin.com/
   - Multiple clean tech merchants
   - Commission: 5-15%
   - Cookie duration: 30-90 days

3. **Direct Manufacturer Programs:**
   - **EcoFlow:** https://www.ecoflow.com/pages/affiliate (5-8%)
   - **Jackery:** Check their website for affiliate program
   - **Anker:** Available through Amazon + direct program

4. **TradeTracker** (Nordics)
   - URL: https://tradetracker.com/
   - Good for local Finnish/Nordic merchants

## Step 2: Generate Your Affiliate Links

### For Amazon Associates:

1. Log in to your Amazon Associates account
2. Use the **SiteStripe** toolbar (appears at top of Amazon.com when logged in)
3. Search for a product (e.g., "Anker Solar Charger")
4. Click "Get Link" in the SiteStripe
5. Copy the **short link** (e.g., `https://amzn.to/3xYzAbc`)

**OR use the full format:**
```
https://www.amazon.de/dp/B0PRODUCT123?tag=YOURTAG-21
```

### For Other Programs:

Most affiliate dashboards provide a link generator. Example:

1. Find product in merchant catalog
2. Click "Get affiliate link"
3. Copy the generated URL

## Step 3: Add UTM Parameters

UTM parameters help you track which content drives sales.

### Recommended UTM Structure:

```
?utm_source=blog&utm_medium=article&utm_campaign=solar_q4_2025&utm_content=PRODUCT_NAME
```

**Parameter meanings:**
- `utm_source`: Where the traffic comes from (e.g., "blog", "instagram", "email")
- `utm_medium`: Type of link (e.g., "article", "banner", "video")
- `utm_campaign`: Marketing campaign (e.g., "solar_q4_2025", "black_friday")
- `utm_content`: Specific product or variant (e.g., "starter_kit_a")

### Combining Affiliate Links + UTM:

**For Amazon:**
```
https://www.amazon.de/dp/B0PRODUCT123?tag=YOURTAG-21&utm_source=blog&utm_medium=article&utm_campaign=solar_q4_2025
```

**For other merchants (if they allow UTM):**
```
https://affiliate-link.com?aff=12345&utm_source=blog&utm_medium=article&utm_campaign=solar_q4_2025
```

⚠️ **Important:** Some affiliate networks strip UTM parameters. Test your links first!

## Step 4: Replace Placeholders

### Method A: Manual Find & Replace (Small projects)

1. Open HTML file in code editor (VS Code, Sublime, etc.)
2. Press `Ctrl+H` (Windows/Linux) or `Cmd+H` (Mac) to open Find & Replace
3. Replace each placeholder:

**Example:**
- **Find:** `AFFILIATE_LINK_STARTER_A{{DEFAULT_UTM}}`
- **Replace:** `https://www.amazon.de/dp/B0ABC123?tag=yourtag-21&utm_source=blog&utm_medium=article&utm_campaign=solar_q4`

Repeat for each unique placeholder.

### Method B: Automated Script (Recommended for multiple files)

Create a replacement script `replace_links.py`:

```python
import os
import re

# Define your affiliate link mappings
AFFILIATE_LINKS = {
    "AFFILIATE_LINK_STARTER_A": "https://www.amazon.de/dp/B0ABC123?tag=yourtag-21",
    "AFFILIATE_LINK_STARTER_B": "https://www.amazon.de/dp/B0DEF456?tag=yourtag-21",
    "AFFILIATE_LINK_MONITOR_1": "https://www.amazon.de/dp/B0GHI789?tag=yourtag-21",
    "AFFILIATE_LINK_MONITOR_2": "https://www.amazon.de/dp/B0JKL012?tag=yourtag-21",
    # Add all your products here
}

# Your default UTM parameters
DEFAULT_UTM = "&utm_source=blog&utm_medium=article&utm_campaign=solar_q4_2025"

# Process all HTML files
for filename in os.listdir('.'):
    if filename.endswith('.html'):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace each placeholder
        for placeholder, link in AFFILIATE_LINKS.items():
            full_placeholder = f"{placeholder}{{{{DEFAULT_UTM}}}}"
            full_link = f"{link}{DEFAULT_UTM}"
            content = content.replace(full_placeholder, full_link)

        # Write back to file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Processed {filename}")

print("🎉 All affiliate links replaced!")
```

**Run the script:**
```bash
python replace_links.py
```

### Method C: Using sed (Linux/Mac command line)

```bash
# Replace single placeholder
sed -i 's|AFFILIATE_LINK_STARTER_A{{DEFAULT_UTM}}|https://amazon.de/dp/B0ABC?tag=yourtag\&utm_source=blog|g' *.html

# Replace multiple (create a script)
cat > replace_all.sh << 'EOF'
#!/bin/bash
sed -i 's|AFFILIATE_LINK_STARTER_A{{DEFAULT_UTM}}|https://amazon.de/dp/B0ABC?tag=yourtag\&utm_source=blog|g' *.html
sed -i 's|AFFILIATE_LINK_STARTER_B{{DEFAULT_UTM}}|https://amazon.de/dp/B0DEF?tag=yourtag\&utm_source=blog|g' *.html
# Add more lines as needed
EOF

chmod +x replace_all.sh
./replace_all.sh
```

## Step 5: Common Placeholders in This Project

Here are the placeholders currently used in the HTML files:

| Placeholder | Product Type | Suggested Source |
|-------------|--------------|------------------|
| `AFFILIATE_LINK_STARTER_A` | Entry-level solar kit (<€200) | Amazon / AliExpress |
| `AFFILIATE_LINK_STARTER_B` | Mid-range solar kit (€200-350) | Amazon / Renogy |
| `AFFILIATE_LINK_STARTER_C` | Premium solar kit (€350-500) | EcoFlow / Jackery |
| `AFFILIATE_LINK_MONITOR_1` | Budget energy monitor | Amazon (Emporia) |
| `AFFILIATE_LINK_MONITOR_2` | Mid-range energy monitor | Amazon (Sense) |
| `AFFILIATE_LINK_MONITOR_3` | Premium energy monitor | Direct from manufacturer |
| `AFFILIATE_LINK_MONITOR_4` | Solar-specific monitor | Specialized vendor |
| `AFFILIATE_LINK_MONITOR_5` | Smart home integration monitor | Amazon / vendor |

## Step 6: Testing Your Links

Before going live, test each affiliate link:

### Manual Testing:
1. Click each link in your HTML file
2. Verify it goes to the correct product
3. Check that your affiliate tag is present in the URL
4. Confirm the product page loads correctly

### Automated Testing Script:

```python
import re
import requests
from urllib.parse import urlparse, parse_qs

def check_affiliate_links(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all links
    links = re.findall(r'href="(https?://[^"]+)"', content)

    print(f"Checking {len(links)} links in {html_file}...\n")

    for link in links:
        # Check if it's an Amazon affiliate link
        if 'amazon' in link:
            parsed = urlparse(link)
            params = parse_qs(parsed.query)

            if 'tag' in params:
                print(f"✅ {link[:50]}... (has affiliate tag)")
            else:
                print(f"❌ {link[:50]}... (MISSING affiliate tag!)")
        else:
            print(f"ℹ️  {link[:50]}... (non-Amazon link)")

    print()

# Check all HTML files
import os
for filename in os.listdir('.'):
    if filename.endswith('.html'):
        check_affiliate_links(filename)
```

## Step 7: Tracking Performance

### Google Analytics 4 Setup:
1. Create GA4 property at https://analytics.google.com/
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add it to GitHub Secrets as `GA4_MEASUREMENT_ID`

### Enhanced Link Tracking:
Use different UTM parameters for different placements:

```
Top of article:
?utm_content=hero_cta

Mid-article:
?utm_content=comparison_table

End of article:
?utm_content=final_recommendation
```

### Bitly/Short Links (Optional):
1. Create free account at https://bitly.com/
2. Create short link for each affiliate URL
3. Track clicks in Bitly dashboard
4. Use short links in social media (not in HTML - use full links there for SEO)

## Step 8: Compliance & Disclosure

### Affiliate Disclosure (Already included in templates):
All HTML files include:
```html
<div class="disclosure">
  <strong>Affiliate note:</strong> We may earn on links. It never changes your price.
</div>
```

### GDPR Compliance (EU):
- Inform users about affiliate links (✅ Done via disclosure)
- Have a privacy policy (⚠️ You need to create this)
- Cookie consent for analytics (⚠️ Add cookie banner if using GA4)

### FTC Compliance (if targeting US):
- Clear disclosure at TOP of each article (✅ Done)
- Use clear language like "We may earn commission" (✅ Done)

## Troubleshooting

### Link doesn't track in affiliate dashboard:
- Verify your affiliate tag is correct
- Check cookie duration (24h for Amazon - user must purchase within 24h)
- Wait 24-48h for reporting (most programs have delay)

### UTM parameters not showing in Google Analytics:
- Ensure GA4 is properly installed (check HTML `<head>`)
- Use GA4 DebugView to see real-time data
- Clear browser cache and test again

### Affiliate program rejects application:
- Add more content to your site (10+ articles recommended)
- Ensure site has clear privacy policy and about page
- Apply again after 30 days if rejected

## Resources

- **Amazon Associates Help:** https://affiliate-program.amazon.com/help/
- **UTM Builder:** https://ga-dev-tools.google/campaign-url-builder/
- **Link Checker:** https://www.deadlinkchecker.com/
- **GDPR Guide:** https://gdpr.eu/

## Quick Start Checklist

- [ ] Join 2-3 affiliate programs (start with Amazon)
- [ ] Get approval (may take 1-7 days)
- [ ] Generate affiliate links for top 10 products
- [ ] Create a spreadsheet: Product | Placeholder | Affiliate Link
- [ ] Run replacement script (Method B above)
- [ ] Test all links manually
- [ ] Check affiliate tags are present
- [ ] Add GA4 tracking code
- [ ] Publish and monitor performance

Good luck with your affiliate marketing! 💰
