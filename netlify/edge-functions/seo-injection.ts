// @ts-nocheck
import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter/index.ts";

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only handle Blog and Careers for now
  const isBlog = path.startsWith("/blog/");
  const isCareer = path.startsWith("/careers");
  
  if (!isBlog && !isCareer) {
    return context.next();
  }

  try {
    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
    const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials in Edge Function");
      return context.next();
    }

    let seoData = null;

    if (isBlog) {
      const slug = path.split("/").pop();
      if (slug && slug !== "blog") {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${slug}&published=eq.true&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const post = data[0];
          const cleanBody = post.content ? post.content.replace(/<[^>]*>?/gm, "").substring(0, 5000) : "";
          seoData = {
            title: post.seo_title || `${post.title} | CareerGuide AI Blog`,
            description: post.seo_description || post.excerpt || "Career guidance and insights for Kenyan students.",
            image: post.cover_image_url || "https://careerguideai.co.ke/logos/CareerGuide_Logo.png",
            type: "article",
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.seo_description || post.excerpt,
              "articleBody": cleanBody,
              "image": post.cover_image_url,
              "datePublished": post.published_at,
              "author": {
                "@type": "Organization",
                "name": "CareerGuide AI",
                "url": "https://careerguideai.co.ke"
              }
            }
          };
        }
      }
    }

    // If we have SEO data, inject it into the HTML
    if (seoData) {
      const response = await context.next();
      
      return new HTMLRewriter()
        .on("title", {
          element(el: any) {
            el.setInnerContent(seoData.title);
          }
        })
        .on("head", {
          element(el: any) {
            // Add Meta Tags
            el.append(`<meta name="description" content="${seoData.description.replace(/"/g, '&quot;')}" />`, { html: true });
            el.append(`<meta property="og:title" content="${seoData.title.replace(/"/g, '&quot;')}" />`, { html: true });
            el.append(`<meta property="og:description" content="${seoData.description.replace(/"/g, '&quot;')}" />`, { html: true });
            el.append(`<meta property="og:image" content="${seoData.image}" />`, { html: true });
            el.append(`<meta property="og:type" content="${seoData.type}" />`, { html: true });
            el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
            
            // Add JSON-LD
            el.append(`<script type="application/ld+json">${JSON.stringify(seoData.jsonLd)}</script>`, { html: true });
          }
        })
        .transform(response);
    }

  } catch (error) {
    console.error("SEO Injection Error:", error);
  }

  return context.next();
};

// Netlify Edge Function config
export const config = {
  path: ["/blog/*", "/careers*"]
};
