import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { BlogPost } from './BlogIndex';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (!error && data) {
        setPost(data as any);
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl font-black text-white mb-4">404</h1>
          <p className="text-xl text-slate-400 mb-8">Article not found or has been removed.</p>
          <Link to="/blog" className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const readingTime = post.content ? Math.ceil(post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200) : 1;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-white flex flex-col">
      <Helmet>
        <title>{post.seo_title || `${post.title} | CareerGuide Blog`}</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
      </Helmet>
      
      <Navigation />

      <main className="flex-1 relative z-10 w-full overflow-x-hidden">
        {/* Header Hero Section */}
        <div className="relative pt-40 pb-32 text-center px-4">
          <div className="absolute inset-0 z-0">
             {post.cover_image_url ? (
               <>
                 <img src={post.cover_image_url} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
                 <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background" />
               </>
             ) : (
                 <div className="w-full h-full bg-slate-900" />
             )}
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <Link to="/blog" className="inline-flex items-center text-primary font-bold text-sm uppercase tracking-widest hover:text-white transition-colors mb-12">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
            </Link>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-black font-serif text-white tracking-tight leading-tight mb-8">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                  <Clock className="w-4 h-4 text-primary" />
                  {readingTime} min read
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Featured Image */}
        {post.cover_image_url && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 -mt-16 relative z-20">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.2 }}
                 className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[21/9] bg-slate-900"
              >
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
              </motion.div>
            </div>
        )}

        {/* Article Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <motion.article 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg prose-slate max-w-none
              prose-headings:font-black prose-headings:tracking-tight 
              prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 
              prose-img:rounded-2xl prose-img:shadow-xl
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-300 prose-ul:font-medium
              prose-strong:text-white
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
