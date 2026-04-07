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
  console.error('❌ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const staticRoutes = [
  '',
  '/about',
  '/how-it-works',
  '/faq',
  '/careers',
  '/blog',
];

async function generateSitemap() {
  console.log('🚀 Generating sitemap...');
  
  try {
    // 1. Fetch data in parallel
    const [blogRes, careerRes] = await Promise.all([
      supabase.from('blog_posts').select('slug, published_at').eq('published', true),
      supabase.from('career_paths').select('id, title')
    ]);

    if (blogRes.error) throw blogRes.error;
    if (careerRes.error) throw careerRes.error;

    const posts = blogRes.data || [];
    const careers = careerRes.data || [];

    // 2. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Routes
    staticRoutes.forEach(route => {
      xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add Blog Posts
    posts.forEach(post => {
      xml += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.published_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Careers (Direct links if applicable, or just careers page with queries)
    // Note: If you have dynamic career detail pages like /career/:id, add them here.
    // Given the current app, they open in modals or /quick-assessment?career=...
    careers.slice(0, 1000).forEach(career => {
       xml += `
  <url>
    <loc>${BASE_URL}/careers?search=${encodeURIComponent(career.title)}</loc>
    <priority>0.5</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    // 3. Save
    fs.writeFileSync('public/sitemap.xml', xml);
    console.log(`✅ Sitemap successfully generated at public/sitemap.xml`);
    console.log(`📊 Stats: ${staticRoutes.length} static, ${posts.length} blogs, ${careers.length > 50 ? 50 : careers.length} careers indexed.`);

  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
