import { ChatMessage } from './ai-service';

export interface GuestProfile {
  name?: string;
  curriculum?: string;
  age?: string;
  grade?: string;
  pathway?: string;
  subjects?: string[];
  interests?: string[];
  careerGoals?: string;
  aiSummary?: string;
  values?: string[];
  mbti?: string;
  workStyle?: string;
  barriers?: string;
  experience?: string;
  readiness?: string;
  strengths?: string[];
  challenges?: string[];
  dreamJob?: string;
  location?: string;
  resultsVerified?: boolean;
}

export interface CareerRecommendation {
  title: string;
  matchPercentage: number;
  description: string;
  requiredSubjects: string[];
  universities: string[];
  salaryRange: string;
  jobOutlook: string;
  education?: string;
  actionabilityScore?: number;
  whyRecommended?: string;
}

export class ReportGenerator {
  static generatePDFReport(
    profile: GuestProfile,
    conversation: ChatMessage[],
    recommendations: CareerRecommendation[] = []
  ): string {
    const currentDate = new Date().toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const reportId = Date.now().toString().slice(-6);

    // Brand Colors from index.css HSL values
    const colors = {
      primary: '#2563eb', // Professional Blue
      secondary: '#15803d', // Professional Deep Green
      accent: '#c084fc', // Purple accent
      warning: '#f59e0b', // Amber/Warning
      text: '#0f172a',
      muted: '#475569',
      light: '#f8fafc',
      white: '#ffffff',
      border: '#e2e8f0'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Career Assessment Report - ${profile.name || 'Student'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          color: ${colors.text}; 
          background: ${colors.white}; 
          line-height: 1.5;
          font-size: 14px;
        }
        
        .report-page { 
          width: 800px; 
          margin: 0 auto; 
          padding: 60px 70px; 
          background: ${colors.white};
        }
        
        /* HEADER SECTION */
        .branding {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .logo-placeholder {
          font-size: 20px;
          font-weight: 800;
          color: ${colors.primary};
          margin-bottom: 15px;
          letter-spacing: 1.5px;
        }
        
        .report-title {
          font-size: 36px;
          font-weight: 800;
          color: ${colors.primary};
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 30px;
        }
        
        /* STUDENT INFO TABLE */
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 50px;
        }
        
        .info-cell {
          width: 50%;
          vertical-align: top;
        }
        
        .student-name {
          font-size: 32px;
          font-weight: 800;
          color: ${colors.primary};
          margin-bottom: 8px;
          line-height: 1.1;
        }
        
        .info-label {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.primary};
          opacity: 0.7;
          margin-bottom: 4px;
        }
        
        /* SECTION TITLES */
        .section-header {
          font-size: 20px;
          font-weight: 800;
          color: ${colors.primary};
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 1.5px;
        }
        
        /* WHAT WE FOUND SECTION */
        .diagnostic-block {
          border-left: 8px solid ${colors.secondary};
          background: #f0f7f4;
          padding: 25px 30px;
          margin-bottom: 30px;
          border-radius: 0 12px 12px 0;
        }
        
        .diagnostic-text {
          font-size: 16px;
          font-style: italic;
          color: ${colors.primary};
          line-height: 1.7;
        }
        
        .strengths-container {
          margin-bottom: 50px;
          padding-left: 10px;
        }
        
        .strength-item {
          font-size: 15px;
          color: ${colors.primary};
          margin-bottom: 12px;
          line-height: 1.4;
        }
        
        .strength-tag {
          font-weight: 800;
        }
        
        /* PATHWAY CARDS */
        .pathways-container {
          margin-bottom: 50px;
        }
        
        .pathway-card {
          display: table;
          width: 100%;
          margin-bottom: 20px;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .pathway-num {
          display: table-cell;
          width: 70px;
          text-align: center;
          vertical-align: middle;
          background: ${colors.secondary};
          color: ${colors.white};
          font-size: 36px;
          font-weight: 800;
          border-radius: 12px 0 0 12px;
        }
        
        .pathway-content {
          display: table-cell;
          padding: 25px 30px;
          background: #f0f8f5;
          border-radius: 0 12px 12px 0;
          vertical-align: top;
        }
        
        .pathway-title {
          font-size: 20px;
          font-weight: 800;
          color: ${colors.secondary};
          margin-bottom: 8px;
        }
        
        .pathway-desc {
          font-size: 14px;
          color: ${colors.text};
          margin-bottom: 10px;
          line-height: 1.6;
        }
        
        .pathway-details {
          font-size: 13px;
          font-style: italic;
          color: ${colors.muted};
        }
        
        /* COLOR VARIANTS FOR PATHWAYS */
        .pathway-2 .pathway-num { background: ${colors.warning}; }
        .pathway-2 .pathway-content { background: #fffcf0; }
        .pathway-2 .pathway-title { color: ${colors.warning}; }
        
        .pathway-3 .pathway-num { background: ${colors.accent}; }
        .pathway-3 .pathway-content { background: #faf5ff; }
        .pathway-3 .pathway-title { color: ${colors.accent}; }
        
        /* NEXT STEPS SECTION */
        .next-steps-block {
          background: ${colors.primary};
          color: ${colors.white};
          padding: 40px;
          border-radius: 16px;
          margin-top: 50px;
        }
        
        .next-steps-title {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 25px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .steps-list {
          list-style: none;
        }
        
        .step-item {
          margin-bottom: 15px;
          padding-left: 30px;
          position: relative;
          font-size: 15px;
          line-height: 1.4;
        }
        
        .step-item::before {
          content: "•";
          position: absolute;
          left: 0;
          font-weight: 800;
          font-size: 20px;
          top: -2px;
        }
        
        /* FOOTER */
        .report-footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid ${colors.border};
          text-align: center;
        }
        
        .footer-tagline {
          font-size: 14px;
          font-style: italic;
          color: ${colors.muted};
          margin-bottom: 12px;
        }
        
        .footer-brand {
          font-size: 12px;
          color: #adb5bd;
          letter-spacing: 0.5px;
        }
        
        @media print {
          .report-page { padding: 0; margin: 0; width: 100%; }
        }
    </style>
</head>
<body>
    <div class="report-page">
        <!-- BRANDING -->
        <div class="branding">
            <div class="logo-placeholder">CAREERGUIDE AI</div>
            <h1 class="report-title">Career Assessment Report</h1>
        </div>
        
        <!-- STUDENT INFO -->
        <table class="info-table">
            <tr>
                <td class="info-cell">
                    <div class="student-name">${profile.name?.toUpperCase() || 'STUDENT'}</div>
                    <div class="info-label">ID: ${reportId}</div>
                    <div class="info-label">Curriculum: ${profile.curriculum === 'igcse' ? 'British IGCSE/A-Level' : profile.curriculum === 'legacy' ? 'Kenyan Legacy (8-4-4)' : 'Kenyan CBC'}</div>
                    ${profile.pathway ? `<div class="info-label">Pathway: ${profile.pathway.toUpperCase()}</div>` : ''}
                    <div class="info-label">Date: ${currentDate}</div>
                </td>
                <td class="info-cell" style="text-align: right;">
                    ${profile.resultsVerified ? `
                    <div style="display: inline-block; padding: 8px 15px; background: ${colors.secondary}; color: white; border-radius: 8px; font-weight: 800; font-size: 12px; letter-spacing: 1px;">
                        ✓ VERIFIED OFFICIAL RESULTS
                    </div>
                    ` : ''}
                </td>
            </tr>
        </table>
        
        <!-- WHAT WE FOUND -->
        <div class="section-header">What we found</div>
        <div class="diagnostic-block">
            <div class="diagnostic-text">
                ${profile.aiSummary ? profile.aiSummary.replace(/<\/?[^>]+(>|$)/g, "").split('.')[0] + '.' : 'You show strong aptitude across practical and analytical subjects. Your interest blend suggests you thrive at intersections where you can apply both creativity and problem-solving.'}
            </div>
        </div>
        
        <div class="strengths-container">
            <div class="strength-item">
                <span class="strength-tag" style="color: ${colors.secondary};">Analytical thinking</span>
                — strong logical reasoning and problem-solving.
            </div>
            <div class="strength-item">
                <span class="strength-tag" style="color: ${colors.warning};">Curious mind</span>
                — wide-ranging interests across disciplines.
            </div>
            <div class="strength-item">
                <span class="strength-tag" style="color: ${colors.accent};">Highly adaptable</span>
                — flexible and can bridge science and humanities.
            </div>
        </div>
        
        <!-- YOUR PATH FORWARD -->
        <div class="section-header">Your path forward</div>
        <p style="font-size: 15px; color: ${colors.muted}; margin-bottom: 25px;">Based on your profile, here are three compelling pathways. Each leverages your strengths in different ways:</p>
        
        <div class="pathways-container">
            ${recommendations.length > 0 ? recommendations.slice(0, 3).map((rec, idx) => `
                <div class="pathway-card pathway-${idx + 1}">
                    <div class="pathway-num">${idx + 1}</div>
                    <div class="pathway-content">
                        <div class="pathway-title">${rec.title}</div>
                        <div class="pathway-desc">${rec.description}</div>
                        <div class="pathway-details">Required: ${Array.isArray(rec.requiredSubjects) ? rec.requiredSubjects.join(', ') : rec.requiredSubjects || 'N/A'}</div>
                    </div>
                </div>
            `).join('') : `
                <div class="pathway-card pathway-1">
                    <div class="pathway-num">1</div>
                    <div class="pathway-content">
                        <div class="pathway-title">Software Engineering & Innovation</div>
                        <div class="pathway-desc">Leveraging your logical reasoning to build scalable solutions.</div>
                        <div class="pathway-details">Focus on Mathematics and Computer Science.</div>
                    </div>
                </div>
                <div class="pathway-card pathway-2">
                    <div class="pathway-num">2</div>
                    <div class="pathway-content">
                        <div class="pathway-title">Data Science & Analytics</div>
                        <div class="pathway-desc">Applying your curious mind to find patterns in complex data.</div>
                        <div class="pathway-details">Focus on Statistics and Economics.</div>
                    </div>
                </div>
                <div class="pathway-card pathway-3">
                    <div class="pathway-num">3</div>
                    <div class="pathway-content">
                        <div class="pathway-title">UX/UI Design & Digital Arts</div>
                        <div class="pathway-desc">Bridging the gap between technology and human psychology.</div>
                        <div class="pathway-details">Focus on Design and Psychology.</div>
                    </div>
                </div>
            `}
        </div>
        
        <!-- NEXT STEPS -->
        <div class="next-steps-block">
            <h2 class="next-steps-title">Immediate Actions</h2>
            <ul class="steps-list">
                <li class="step-item">Research universities offering your chosen pathway</li>
                <li class="step-item">Connect with professionals in these fields (LinkedIn, local networks)</li>
                <li class="step-item">Plan curriculum choices strategically around your pathway</li>
                <li class="step-item">Explore internships or projects in your chosen field</li>
            </ul>
        </div>
        
        <!-- FOOTER -->
        <div class="report-footer">
            <p class="footer-tagline">Need personalized guidance? Visit careerguideai.netlify.app</p>
            <p class="footer-brand">CareerGuide AI | Specialized Kenyan Academic Mapping</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static extractAISummary(conversation: ChatMessage[]): string {
    const assistantMsgs = conversation.filter(m => m.role === 'assistant').map(m => m.content);
    if (assistantMsgs.length === 0) return '<p>No AI summary available yet.</p>';

    // Take the last substantial assistant message as the summary
    const summary = assistantMsgs.reverse().find(t => (t || '').length > 80) || assistantMsgs[0];

    // Clean and format the summary with proper list parsing
    const formattedSummary = summary
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .slice(0, 1800);

    // Convert to HTML with proper list formatting
    const lines = formattedSummary.split('\n').filter(line => line.trim().length > 0);
    let html = '';
    let inList = false;
    let listItems: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for bullet points or numbered lists
      if (trimmedLine.match(/^[\d]+\.\s/) || trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^[1-9]\.\s/)) {
        if (!inList) {
          // Close previous paragraph if any
          if (html && !html.endsWith('</ul>') && !html.endsWith('</ol>')) {
            html += '</p>';
          }
          inList = true;
          listItems = [];
        }

        // Extract list item content
        const itemContent = trimmedLine.replace(/^[\d]+\.\s/, '').replace(/^[-•*]\s/, '').trim();
        listItems.push(`<li>${itemContent}</li>`);
      } else {
        // Close list if we were in one
        if (inList && listItems.length > 0) {
          const isNumbered = listItems.some(item => item.includes('</li>'));
          const listTag = isNumbered ? 'ol' : 'ul';
          html += `<${listTag} class="bullet-list">${listItems.join('')}</${listTag}>`;
          listItems = [];
          inList = false;
        }

        // Add as paragraph
        if (trimmedLine.length > 0) {
          html += `<p>${trimmedLine}</p>`;
        }
      }
    }

    // Close any remaining list
    if (inList && listItems.length > 0) {
      const isNumbered = listItems.some(item => item.includes('</li>'));
      const listTag = isNumbered ? 'ol' : 'ul';
      html += `<${listTag} class="bullet-list">${listItems.join('')}</${listTag}>`;
    }

    return html || '<p>Assessment summary will be available after completion.</p>';
  }

  static extractNextSteps(conversation: ChatMessage[]): string {
    const assistantMsgs = conversation.filter(m => m.role === 'assistant').map(m => m.content);
    if (assistantMsgs.length === 0) {
      return '<p><em>Next steps will be provided after the AI completes the assessment summary.</em></p>';
    }

    // Look for next steps in the AI summary
    const summary = assistantMsgs.reverse().find(t => (t || '').length > 80) || assistantMsgs[0];

    // Look for patterns that indicate next steps
    const nextStepsPatterns = [
      /next steps?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /recommended actions?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /what to do next[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /immediate actions?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /follow-up steps?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /recommendations?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is,
      /suggestions?[:-]?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is
    ];

    for (const pattern of nextStepsPatterns) {
      const match = summary.match(pattern);
      if (match && match[1]) {
        const nextStepsText = match[1].trim();

        // Convert to HTML list format
        const lines = nextStepsText.split('\n').filter(line => line.trim().length > 0);
        let html = '<h4>AI Recommended Next Steps</h4>';

        // Check if it's already a list format
        const hasListMarkers = lines.some(line =>
          line.match(/^[\d]+\.\s/) || line.match(/^[-•*]\s/) || line.match(/^[1-9]\.\s/)
        );

        if (hasListMarkers) {
          html += '<ol class="numbered-list">';
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.match(/^[\d]+\.\s/) || trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^[1-9]\.\s/)) {
              const itemContent = trimmedLine.replace(/^[\d]+\.\s/, '').replace(/^[-•*]\s/, '').trim();
              if (itemContent) {
                html += `<li>${itemContent}</li>`;
              }
            }
          }
          html += '</ol>';
        } else {
          // Convert paragraphs to list items
          html += '<ol class="numbered-list">';
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              html += `<li>${trimmedLine}</li>`;
            }
          }
          html += '</ol>';
        }

        return html;
      }
    }

    // If no specific next steps found, try to extract any actionable items from the summary
    const actionablePatterns = [
      /(?:you should|you can|try to|consider|focus on|work on|develop|build|improve|enhance)[^.!?]*[.!?]/gi
    ];

    for (const pattern of actionablePatterns) {
      const matches = summary.match(pattern);
      if (matches && matches.length > 0) {
        let html = '<h4>AI Recommended Actions</h4><ol class="numbered-list">';
        matches.forEach(match => {
          const cleanMatch = match.trim().replace(/^(?:you should|you can|try to|consider|focus on|work on|develop|build|improve|enhance)\s*/i, '');
          if (cleanMatch) {
            html += `<li>${cleanMatch}</li>`;
          }
        });
        html += '</ol>';
        return html;
      }
    }

    // If still no next steps found, show a message
    return '<p><em>Next steps will be provided in the AI assessment summary. Please ensure the AI has completed its analysis.</em></p>';
  }

  static getCBEPathInfo(grade?: string): string {
    if (!grade) return "Complete your profile to see your CBE pathway";

    const gradeNum = parseInt(grade.replace(/\D/g, ''));

    if (gradeNum <= 6) {
      return "Primary Education - Building foundational skills in core subjects";
    } else if (gradeNum <= 9) {
      return "Junior Secondary - Exploring broad-based learning across all CBE areas";
    } else if (gradeNum <= 12) {
      return "Senior Secondary - Specializing in chosen pathway (STEM, Arts, etc.)";
    } else {
      return "Tertiary Education - University or technical college level";
    }
  }

  static getNextSteps(grade?: string): string {
    if (!grade) return "Determine your current grade level";

    const gradeNum = parseInt(grade.replace(/\D/g, ''));

    if (gradeNum <= 6) {
      return "Prepare for Junior Secondary transition, focus on core subjects";
    } else if (gradeNum <= 8) {
      return "Explore different learning areas to identify your strengths and interests";
    } else if (gradeNum === 9) {
      return "Choose your Senior Secondary pathway based on career goals";
    } else if (gradeNum <= 12) {
      return "Prepare for university entrance exams and career specialization";
    } else {
      return "Focus on career development and professional skills";
    }
  }

  static async downloadPDF(htmlContent: string, filename: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    await html2pdf()
      .from(container)
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
    document.body.removeChild(container);
  }

  static generateTextReport(profile: GuestProfile, conversation: ChatMessage[]): string {
    const currentDate = new Date().toLocaleDateString();

    return `
CAREERGUIDE AI - QUICK ASSESSMENT REPORT
Generated on: ${currentDate}

STUDENT PROFILE:
${Object.entries(profile).map(([key, value]) =>
      value ? `${key.toUpperCase()}: ${Array.isArray(value) ? value.join(', ') : value}` : ''
    ).filter(Boolean).join('\n')}

CBE PATHWAY INFORMATION:
Current Path: ${this.getCBEPathInfo(profile.grade)}
Next Steps: ${this.getNextSteps(profile.grade)}

ASSESSMENT CONVERSATION:
${conversation.filter(msg => msg.role === 'user').map((msg, index) =>
      `Q${index + 1}: ${msg.content}`
    ).join('\n\n')}

AI INSIGHTS:
${conversation.filter(msg => msg.role === 'assistant' &&
      (msg.content.includes('recommend') || msg.content.includes('suggest') || msg.content.includes('career'))
    ).map(msg => msg.content).join('\n\n')}

NEXT STEPS:
1. Create your full profile at CareerGuide AI
2. Take comprehensive CBE-aligned assessments
3. Explore university programs matching your interests
4. Connect with career counselors for personalized guidance
5. Research scholarship opportunities in Kenya
6. Join relevant extracurricular activities

Visit: ${window.location.origin} to continue your career journey!

---
This report is generated by AI and should be used as guidance alongside professional career counseling.
CareerGuide AI - Empowering Kenya's Students Through CBE
    `;
  }

  static downloadHTMLReport(htmlContent: string, filename: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
