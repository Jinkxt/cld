# Immobilier Analyser

**Compare Renting vs Buying vs Inheriting in France**

A interactive financial analysis tool that models the lifetime cost of three real estate strategies in the French market — renting, buying with a mortgage, and inheriting property — accounting for French-specific taxes, fees, and regulations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Static Site](https://img.shields.io/badge/static-yes-green.svg)
![No Build Step](https://img.shields.io/badge/build-none-brightgreen.svg)

---

## Features

- **Three-scenario comparison** — Rent, Buy, and Inherit analyzed side-by-side over a lifetime (age 25–85)
- **French tax modeling** — Notaire fees (7.5%), inheritance tax (0–60%), capital gains tax (0–45%), property tax (ITP), and home insurance
- **Real-time parameter adjustment** — All sliders update calculations, charts, and insights instantly
- **Interactive ECharts visualizations** — Cumulative cost curves, net cost after equity, and mini sparkline previews
- **Detailed cost breakdowns** — Itemized view of every cost component per scenario
- **Comparison matrix** — Side-by-side financial metrics with auto-generated key insights
- **Bilingual UI** — Full English and French interface with persistent language preference
- **Dark and light themes** — Toggle between themes, preference saved to localStorage
- **No server required** — Pure static HTML/CSS/JS, runs entirely in the browser

---

## How It Works

The simulator models three lifetime strategies from age 25 to 85:

| Strategy | Description |
|-----------|-------------|
| **Rent** | Pay rent throughout, adjusted annually for inflation. No equity is built. |
| **Buy** | Rent until the buying age, then purchase with a down payment and 25-year mortgage. Account for acquisition fees, ongoing maintenance, property tax, and insurance. Equity builds as the mortgage is paid off. |
| **Inherit** | Rent until the inheritance age, then receive the property. Pay inheritance tax upfront, then cover maintenance and property tax going forward. |

### Financial Model

The calculator incorporates the following French-specific costs:

- **Frais de notaire** — 7.5% acquisition fees on purchase
- **Mortgage** — 25-year fixed rate, configurable interest rate (2–8%)
- **Annual maintenance** — €2,500/year
- **Taxe foncière (ITP)** — €800/year
- **Home insurance** — €300/year
- **Inheritance tax** — Configurable from 0% (direct child) to 60% (unrelated)
- **Capital gains tax** — Applied on property appreciation at sale, configurable (0–45%)
- **Rent inflation** — Annual increase applied to rent (0.5–5%)

### Adjustable Parameters

| Parameter | Range | Default |
|-----------|-------|---------|
| Property Price | €150k – €1M | €400,000 |
| Down Payment | 10% – 50% | 20% |
| Mortgage Rate | 2% – 8% | 4.5% |
| Monthly Rent | €500 – €5,000 | €2,000 |
| Annual Inflation | 0.5% – 5% | 2% |
| Buying Age | 25 – 65 | 35 |
| Inheritance Age | 25 – 75 | 45 |
| Inheritance Tax | 0% – 60% | 60% |
| Capital Gains Tax | 0% – 45% | 19% |

---

## Screenshots

The interface is organized into three tabs:

- **Overview** — Metric cards with sparklines for each scenario, plus cumulative cost and net cost charts
- **Detailed Analysis** — Itemized breakdown of every cost component (rent before buy, down payment, acquisition fees, mortgage paid, maintenance/tax, equity, capital gains tax)
- **Comparison** — Matrix table comparing total spent, equity at 85, and net cost, alongside auto-generated key insights

---

## Getting Started

### Local Usage

No installation or build step is required. Open `index.html` directly in a browser:

```bash
# Clone the repository
git clone https://github.com/Jinkxt/cld.git
cd cld

# Open in browser
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8000
```

### Deploy on GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings > Pages** in your repo
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**

A demo app lives at:

```
https://jinkxt.github.io/cld/
```

> **Note:** GitHub Pages on free accounts requires the repository to be public.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure and layout |
| CSS3 | Styling, animations, dark/light themes, responsive design |
| Vanilla JavaScript | Calculation engine, DOM manipulation, state management |
| [Apache ECharts 5](https://echarts.apache.org/) | Interactive data visualization |
| [Inter](https://rsms.me/inter/) (Google Fonts) | Typography |

No frameworks, no build tools, no dependencies to install. The only external resource is the ECharts CDN script and the Inter font.

---

## Project Structure

```
cld/
├── index.html          # Main application entry point
├── app.js              # Calculation engine, charts, UI logic, translations
├── styles.css          # Full stylesheet including themes and responsive breakpoints
└── README.md           # This file
```

---

## Browser Support

Tested on modern evergreen browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled. The responsive layout adapts for desktop (sidebar + main panel) and hides the sidebar on screens below 768px.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.