import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 pb-12">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"
          >
            <Lock size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black font-serif tracking-tight text-foreground mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </motion.p>
        </div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose dark:prose-invert prose-lg md:prose-xl max-w-none
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
            prose-a:text-primary prose-a:font-semibold hover:prose-a:text-primary/80 
            prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-li:text-muted-foreground
          "
        >
          <h2>1. Introduction</h2>
          <p>
            At CareerGuide AI, highly conscious of student data protection, we take your privacy incredibly seriously. This Privacy Policy outlines what data we collect, why we collect it, and how it is secured.
          </p>

          <h2>2. Data Collection</h2>
          <p>We strictly collect the minimal amount of data required to compute effective AI career pathways:</p>
          <ul>
            <li><strong>Identifiers:</strong> NEMIS UPI Numbers, School Codes, and Email Addresses (for administrators).</li>
            <li><strong>Assessment Data:</strong> RIASEC personality inputs, academic subjects, stated interests, and career goals.</li>
            <li><strong>Usage Logs:</strong> Basic platform telemetry to improve our application.</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>
            The collected data is heavily processed to train and retrieve AI counseling insights. <strong>We do not, under any circumstances, sell student academic or personal profiles to third-party marketers.</strong> Information is strictly exchanged securely with our deep-learning AI interfaces to yield relevant career pathways.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            All academic profiles and credentials are systematically encrypted and stored tightly behind Row Level Security (RLS) policies deployed securely in Supabase. Your profile data is invisible to the public internet.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You retain absolute rights to request a full deletion or export of your tracked user profile. If you wish to wipe your AI counseling history, please contact our support desk.
          </p>

          <h2>6. Data Sharing with Schools</h2>
          <p>
            If a student account is linked directly to a registered Institutional (School) dashboard, aggregate and individual academic metrics are shared with authorized teachers and principals using secure dashboard routing.
          </p>

          <h2>7. Contact</h2>
          <p>
            If you have questions about how we handle your data, please contact us immediately at <strong>privacy@careerguideai.co.ke</strong>.
          </p>
        </motion.article>

      </div>
    </div>
  );
};

export default Privacy;
