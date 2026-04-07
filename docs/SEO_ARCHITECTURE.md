# CareerGuide AI: SEO & AI Discovery Architecture

This document explains how we've optimized CareerGuide AI to ensure maximum visibility for Google Search and AI scrapers (like Perplexity, Bing AI, and GPT-4).

## 🌍 The Challenge: SEO with React
Since this is a Single-Page Application (SPA) built with React, bots traditionally see an "empty shell" before JavaScript loads. We solved this without needing a complex migration to Next.js by using **Structured Data** and **Automated Discovery**.

---

## 🛠️ 1. In-App Metadata (The "What")

### **Dynamic Helmets**
We use `react-helmet-async` on every public page to provide unique `<title>` and `<meta name="description">` tags. This ensures that when someone searches for a specific blog post, they see the actual post title in the search results.

### **JSON-LD (Structured Data)**
Bots (especially AI bots) love structured data more than raw HTML. We've injected "Golden Scripts" into key pages:
- **Blog Posts**: Uses `BlogPosting` schema (includes author, date, and excerpt).
- **Careers**: Uses `ItemList` and `Occupation` schema (helps Google show your careers in "Career Search" results).
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

---

## ⚡ 3. Automation (The "How")

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

**Architecture implemented by Antigravity AI on 2026-04-08**
