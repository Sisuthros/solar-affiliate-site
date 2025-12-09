# SolarSavings - Lead Generation Platform

A high-end solar lead generation platform built with Astro, React, and Tailwind CSS.

## Tech Stack

- **Framework:** [Astro](https://astro.build) - Ultra-fast static site generation
- **UI Components:** [React](https://react.dev) - Interactive calculator component
- **Styling:** [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **TypeScript:** Full type safety

## Features

- **Solar Savings Calculator** - Multi-step wizard that captures leads
  - Bill amount slider
  - Zip code input with auto-detect sun hours
  - "Analyzing" loading animation
  - Lead capture form
  - Personalized savings results

- **Conversion-Optimized Landing Page**
  - Hero section with trust signals
  - How it works section
  - Benefits breakdown
  - Testimonials
  - Multiple CTAs

- **Blog/Resources Section**
  - SEO-optimized article layouts
  - Starter kits guide
  - Energy monitors review
  - ROI calculator explained

## Project Structure

```
solar-lead-platform/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── SolarCalculator.jsx    # The money-maker component
│   ├── layouts/
│   │   ├── Layout.astro           # Base layout with sticky header
│   │   └── BlogLayout.astro       # Blog article layout
│   ├── pages/
│   │   ├── index.astro            # Landing page
│   │   └── blog/
│   │       ├── index.astro        # Blog listing
│   │       ├── starter-kits.astro
│   │       ├── energy-monitors.astro
│   │       └── solar-roi-calculator.astro
│   └── styles/
│       └── global.css             # Tailwind + custom styles
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Lead Capture Integration

The calculator component logs leads to the console. To integrate with your CRM:

1. Open `src/components/SolarCalculator.jsx`
2. Find the `handleSubmit` function
3. Uncomment and configure the webhook URL:

```javascript
await fetch('https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK/', {
  method: 'POST',
  body: JSON.stringify(leadData)
});
```

### Lead Data Structure

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "source": "solar_calculator",
  "lead": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "zipCode": "85001",
    "monthlyBill": 180
  },
  "analysis": {
    "state": "Arizona",
    "systemSize": 6,
    "netCost": 11760,
    "annualSavings": 1680,
    "paybackYears": "7.0",
    "savings25Years": 30240
  }
}
```

## Customization

### Colors

Edit `tailwind.config.cjs` to change the color scheme:

```javascript
colors: {
  solar: {
    500: '#22c55e',  // Primary green
    600: '#16a34a',
  },
  sky: {
    500: '#0ea5e9',  // Accent blue
    600: '#0284c7',
  }
}
```

### Calculator Settings

Adjust savings calculations in `SolarCalculator.jsx`:

- `stateSunData`: Sun hours and electricity rates by state
- `systemCost`: $/watt for installation estimates
- `federalCredit`: Tax credit percentage

## Deployment

Build the static site:

```bash
npm run build
```

Deploy the `dist/` folder to any static host:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## License

MIT
