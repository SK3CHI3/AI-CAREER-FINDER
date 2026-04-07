# CareerGuide AI: SEO & AI Discovery Architecture

This document explains how we've optimized CareerGuide AI to ensure maximum visibility for Google Search and AI scrapers (like Perplexity, Bing AI, and GPT-4).

## 🌍 The Challenge: SEO with React
Since this is a Single-Page Application (SPA) built with React, bots traditionally see an "empty shell" before JavaScript loads. We solved this without needing a complex migration to Next.js by using **Netlify Edge Functions** to perform **Server-Side SEO Injection**.

### **How it Works (Edge-Side Injection)**
1.  **Bot Requests Page**: A bot (Google, Perplexity, etc.) requests `/blog/your-post`.
2.  **Edge Function Intercepts**: A Netlify Edge Function (Deno-based) catches the request before it reaches the browser.
3.  **Supabase Fetch**: The function fetches the specific `title`, `description`, and `content` from Supabase on the shelf.
4.  **HTML Rewriting**: It uses `HTMLRewriter` to inject the tags and JSON-LD directly into the `<head>` of the initial HTML.
5.  **Bot Sees Everything**: The bot receives a fully populated HTML file with the `articleBody` and `meta` tags instantly, without needing a browser or JavaScript.

---

## 🛠️ 1. In-App Metadata (The "What")

### **Dynamic Helmets**
We use `react-helmet-async` on every public page to provide unique `<title>` and `<meta name="description">` tags. This ensures that when someone searches for a specific blog post, they see the actual post title in the search results.

### **JSON-LD (Structured Data)**
Bots (especially AI bots) love structured data more than raw HTML. We've injected "Golden Scripts" into key pages:
- **Blog Posts**: Uses `BlogPosting` schema (includes author, date, and excerpt). **New**: Now includes `articleBody` (plain text) to ensure bots index the full article content even if they don't execute JavaScript.
- **Careers**: Uses `ItemList` and `Occupation` schema (helps Google show your careers in "Career Search" results). **Enhanced**: Now supports up to 1000 items per fetch for broad discoverability.
- **FAQ**: Uses `FAQPage` schema (enables those expandable answer boxes in Google).
- **Homepage**: Uses `Organization` schema to establish your brand identity.

---

## 🛰️ 2. Discovery (The "Where")

### **Automated Sitemap**
We've replaced your static sitemap with a dynamic script: `scripts/generate-sitemap.js`.
- It connects to your Supabase database.
- It fetches every **published** blog post and career path.
- It writes a fresh `public/sitemap.xml` during every build.

### **Robots.txt**
Your `/public/robots.txt` is optimized to:
- Encourage indexing of `/blog`, `/careers`, and public pages.
- Disallow indexing of private areas like `/admin`, `/dashboard`, and `/school`.
- Point all bots directly to the sitemap.
- **Sitemap Coverage**: The sitemap now dynamically generates links for up to 1000 career paths, ensuring your entire library is crawlable.

---

## 🏎️ 3. Core Web Vitals (The "Speed")

Search engines now prioritize **Page Experience**. We've optimized the mobile interface to improve these scores:
- **LCP (Largest Contentful Paint)**: Added `loading="lazy"` to all career cards and optimized the Hero section to load instantly.
- **CLS (Cumulative Layout Shift)**: Implemented smooth `framer-motion` transitions and fixed-height skeletons to prevent elements from "jumping" during load.
- **Mobile Friendliness**: Overhauled the Navigation and Grid systems to ensure 100% compliance with mobile usability standards.

We have established a **fully automated rebuild pipeline**:

### **Netlify Build Command**
Your `netlify.toml` is now configured to run:
`npm run build && npm run sitemap`
This ensures the sitemap is always updated with the latest content before your site goes live.

### **Supabase Build Trigger**
We have added a custom **Database Trigger** in your Supabase project.
- **When**: You INSERT, UPDATE, or DELETE a blog post or career path.
- **Action**: Supabase sends an instant "Ping" to your Netlify Build Hook.
- **Result**: Netlify automatically pulls the latest content and rebuilds the site for the best SEO.

---

## 📖 Maintenance & Troubleshooting

### **How to manually update the Sitemap**
If you want to refresh the sitemap without building the whole site:
`npm run sitemap`

### **How to verify your SEO**
1. **Google Search Console**: Submit your sitemap link (`https://careerguideai.co.ke/sitemap.xml`).
2. **Google Rich Results Test**: Paste any blog URL to see if your JSON-LD is valid.
3. **AI Check**: Ask an AI agent (like Perplexity) to summarize your latest blog post. It should now see the full content instantly.

---

**Architecture maintained and optimized by Antigravity AI**
*Last Update: 2026-04-08 (Mobile Optimization & Enhanced Bot Indexing)*
