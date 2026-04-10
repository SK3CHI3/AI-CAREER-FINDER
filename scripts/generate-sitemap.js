import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- CONFIG ---
const BASE_URL = 'https://careerguideai.co.ke';

// --- MANUAL .ENV LOADER ---
function loadEnv() {
  try {
    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    return Object.fromEntries(
      content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const [key, ...values] = line.split('=');
          return [key, values.join('=').replace(/^["']|["']$/g, '')];
        })
    );
  } catch (e) {
    console.warn('⚠️ Could not load .env file manually');
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.9', changefreq: 'monthly' },
  { path: '/careers', priority: '1.0', changefreq: 'daily' },
  { path: '/quick-assessment', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
];

async function generateSitemap() {
  console.log('🚀 Generating Perfect Sitemap...');
  
  try {
    // 1. Fetch data in parallel
    const [blogRes, careerRes] = await Promise.all([
      supabase.from('blog_posts').select('slug, published_at').eq('published', true),
      supabase.from('career_paths').select('slug, updated_at').eq('is_active', true)
    ]);

    if (blogRes.error) throw blogRes.error;
    if (careerRes.error) throw careerRes.error;

    const posts = blogRes.data || [];
    const careers = careerRes.data || [];

    // 2. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    // Add Static Routes
    staticRoutes.forEach(route => {
      xml += `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // Add Blog Posts
    posts.forEach(post => {
      xml += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.published_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add Career Paths
    careers.forEach(career => {
      if (career.slug) {
        xml += `
  <url>
    <loc>${BASE_URL}/careers/${career.slug}</loc>
    <lastmod>${new Date(career.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    xml += '\n</urlset>';

    // 3. Save
    fs.writeFileSync('public/sitemap.xml', xml);
    console.log(`✅ Sitemap successfully generated at public/sitemap.xml`);
    console.log(`📊 Stats: ${staticRoutes.length} static, ${posts.length} blogs, ${careers.length} careers indexed.`);

  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();

