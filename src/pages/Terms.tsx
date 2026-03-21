import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 pb-12">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black font-serif tracking-tight text-foreground mb-4"
          >
            Terms of Service
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
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using CareerGuide AI ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Use of the Platform</h2>
          <p>
            CareerGuide AI provides automated career counseling and educational pathway mapping in alignment with the Kenyan Competency-Based Curriculum (CBC). You agree to use the platform only for lawful educational purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the Platform.
          </p>

          <h2>3. User Accounts & Registration</h2>
          <ul>
            <li><strong>Students:</strong> Must use legitimate NEMIS UPI strings for tracking academic continuity.</li>
            <li><strong>Schools/Teachers:</strong> Are responsible for maintaining the confidentiality of their institutional dashboard credentials.</li>
          </ul>

          <h2>4. AI-Generated Advice</h2>
          <p>
            Our DeepSeek AI engine outputs highly customized career counseling based on student profiles. However, these are strictly algorithmic recommendations. CareerGuide AI is not liable for academic outcomes, admission rejections, or career results occurring as a result of platform guidance.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All platform designs, AI logical structures, branding, and text are owned natively by CareerGuide AI. You may not scrape, copy, or redistribute the internal platform logic.
          </p>

          <h2>6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate any accounts that violate these terms, specifically focusing on abusive or harmful use of our AI assessment engines.
          </p>

          <h2>7. Contact</h2>
          <p>
            For any questions regarding these Terms, please contact us at <strong>hello@careerguideai.co.ke</strong>.
          </p>
        </motion.article>

      </div>
    </div>
  );
};

export default Terms;
