import { ChatMessage } from './ai-service';

export interface GuestProfile {
  name?: string;
  curriculum?: string;
  age?: string;
  grade?: string;
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

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CareerGuide AI Assessment Report</title>
    <style>
        :root { 
          --brand: #2563eb; 
          --brand-light: #3b82f6; 
          --ink: #0f172a; 
          --muted: #475569; 
          --light: #f8fafc; 
          --border: #e2e8f0; 
          --success: #059669;
          --warning: #d97706;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          color: var(--ink); 
          background: #ffffff; 
          line-height: 1.6;
          font-size: 14px;
        }
        
        .report-container { 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 40px; 
          background: #fff;
        }
        
        /* Header Styles */
        .brand-header {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 3px solid var(--brand);
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo-container img {
          width: 80px;
          height: auto;
        }

        .header-text {
          flex: 1;
          text-align: left;
        }
        
        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--brand);
          margin-bottom: 0px;
        }

        .student-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          margin-top: 5px;
        }
        
        .student-details {
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          margin-top: 2px;
        }
        
        .report-meta {
          text-align: right;
          font-size: 12px;
          color: var(--muted);
          background: var(--light);
          padding: 10px;
          border-radius: 6px;
        }
        
        /* Main Content */
        .main-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        
        .main-subtitle {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 40px;
          font-weight: 400;
        }
        
        /* Section Styles */
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--border);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-subtitle {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 12px;
          margin-top: 20px;
        }
        
        /* Profile Grid */
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .profile-item {
          background: var(--light);
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid var(--brand);
        }
        
        .profile-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .profile-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
        }
        
        /* Lists */
        .bullet-list {
          margin: 15px 0;
          padding-left: 0;
        }
        
        .bullet-list li {
          margin: 8px 0;
          padding-left: 20px;
          position: relative;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .bullet-list li::before {
          content: "•";
          color: var(--brand);
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .numbered-list {
          margin: 15px 0;
          padding-left: 0;
        }
        
        .numbered-list li {
          margin: 10px 0;
          padding-left: 25px;
          position: relative;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .numbered-list li::before {
          content: counter(item) ".";
          counter-increment: item;
          color: var(--brand);
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .numbered-list {
          counter-reset: item;
        }
        
        /* Career Recommendations */
        .career-card {
          background: #f8fafc;
          border-left: 5px solid var(--brand);
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        
        .career-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .career-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 4px;
        }
        
        .match-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: #dcfce7;
          color: var(--success);
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
        }
        .match-badge span {
            font-size: 18px;
        }
        .match-badge small {
            font-size: 10px;
            text-transform: uppercase;
        }
        
        .career-details {
          margin: 15px 0;
          padding: 15px;
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        
        .career-details p {
          margin-bottom: 8px;
          font-size: 13px;
        }

        .career-details strong {
          color: var(--brand);
          font-weight: 600;
          display: inline-block;
          width: 140px;
        }

        .why-recommended {
            margin-top: 15px;
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            padding-left: 15px;
            border-left: 3px solid var(--success);
        }
        
        /* AI Summary */
        .ai-summary {
          background: var(--light);
          border-left: 4px solid var(--brand);
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
        }
        
        .ai-summary p {
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.6;
        }
        
        /* CBE Context */
        .cbe-context {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        
        .cbe-context h4 {
          color: var(--warning);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        /* Next Steps */
        .next-steps {
          background: #f0f9ff;
          border: 1px solid var(--brand);
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        
        .next-steps h4 {
          color: var(--brand);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        /* Footer */
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid var(--border);
          text-align: center;
          color: var(--muted);
          font-size: 12px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .footer strong {
          color: var(--brand);
        }
        
        /* Print Styles */
        @media print {
          .report-container {
            margin: 0;
            padding: 20px;
            max-width: none;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="brand-header">
            <div class="logo-container">
                <img src="${window.location.origin}/logos/CareerGuide_Logo.png" alt="CareerGuide Logo" onerror="this.style.display='none'"/>
            </div>
            <div class="header-text">
                <div class="brand-title">CareerGuide AI Report</div>
                <div class="student-title">${profile.name ? profile.name.toUpperCase() : 'STUDENT ASSESSMENT'}</div>
                <div class="student-details">
                    Curriculum: ${profile.curriculum === 'igcse' ? 'British IGCSE' : 'Kenyan CBC'} | Grade: ${profile.grade || 'N/A'}
                </div>
            </div>
            <div class="report-meta">
                <div><strong>Date:</strong> ${currentDate}</div>
                <div><strong>ID:</strong> ${Date.now().toString().slice(-6)}</div>
            </div>
        </div>
        
        <!-- Main Title -->
        <h1 class="main-title">Career Assessment Report</h1>
        <p class="main-subtitle">Personalized guidance aligned to Kenya's Competency-Based Education (CBE) pathways</p>
        
        <!-- Student Profile Section -->
        <div class="section">
            <h2 class="section-title">Student Profile</h2>
            
            <div class="profile-grid">
                ${profile.name ? `
                <div class="profile-item">
                    <div class="profile-label">Full Name</div>
                    <div class="profile-value">${profile.name}</div>
                </div>
                ` : ''}
                
                ${profile.subjects?.length ? `
                <div class="profile-item">
                    <div class="profile-label">CBE Subjects of Interest</div>
                    <div class="profile-value">${profile.subjects.join(', ')}</div>
                </div>
                ` : ''}
                
                ${profile.grade ? `
                <div class="profile-item">
                    <div class="profile-label">Current Grade</div>
                    <div class="profile-value">${profile.grade}</div>
                </div>
                ` : ''}
                
                ${profile.interests?.length ? `
                <div class="profile-item">
                    <div class="profile-label">Career Interests</div>
                    <div class="profile-value">${profile.interests.join(', ')}</div>
                </div>
                ` : ''}
                
                ${profile.age ? `
                <div class="profile-item">
                    <div class="profile-label">Age</div>
                    <div class="profile-value">${profile.age} years</div>
                </div>
                ` : ''}
                
                ${profile.location ? `
                <div class="profile-item">
                    <div class="profile-label">Location</div>
                    <div class="profile-value">${profile.location}</div>
                </div>
                ` : ''}
            </div>
            
            ${profile.careerGoals ? `
            <h3 class="section-subtitle">Career Goals</h3>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.6;">${profile.careerGoals}</p>
            ` : ''}
        </div>

        <!-- Executive AI Summary -->
        ${profile.aiSummary ? `
        <div class="section">
            <h2 class="section-title">Executive Career Analysis</h2>
            <div class="ai-summary" style="font-size: 15px; background: #fffbdf; border-left-color: #eab308; padding: 25px;">
                ${profile.aiSummary}
            </div>
        </div>
        ` : ''}

        <!-- Counselor's Diagnostic Profile -->
        <div class="section">
            <h2 class="section-title">Counselor's Diagnostic Profile</h2>
            <div class="profile-grid">
                ${profile.mbti ? `
                <div class="profile-item">
                    <div class="profile-label">Personality Type (MBTI proxy)</div>
                    <div class="profile-value">${profile.mbti}</div>
                </div>
                ` : ''}
                ${profile.values?.length ? `
                <div class="profile-item">
                    <div class="profile-label">Core Values</div>
                    <div class="profile-value">${profile.values.join(', ')}</div>
                </div>
                ` : ''}
                ${profile.workStyle ? `
                <div class="profile-item">
                    <div class="profile-label">Preferred Work Style</div>
                    <div class="profile-value">${profile.workStyle}</div>
                </div>
                ` : ''}
                ${profile.barriers ? `
                <div class="profile-item" style="border-left-color: var(--warning);">
                    <div class="profile-label">Current Barrier / Challenge</div>
                    <div class="profile-value">${profile.barriers}</div>
                </div>
                ` : ''}
                ${profile.experience ? `
                <div class="profile-item">
                    <div class="profile-label">Real Experience Base</div>
                    <div class="profile-value">${profile.experience}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- CBE Context Section -->
        ${profile.curriculum === 'cbc' ? `
        <div class="section">
            <h2 class="section-title">CBC Pathway Context</h2>
            <div class="cbe-context">
                <h4>Your Current Educational Path</h4>
                <p>${this.getCBEPathInfo(profile.grade)}</p>
                <h4>Recommended Next Steps</h4>
                <p>${this.getNextSteps(profile.grade)}</p>
            </div>
        </div>
        ` : ''}

        <!-- Career Recommendations Section -->
        ${recommendations.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Personalized Career Matches</h2>
            ${recommendations.map(rec => `
                <div class="career-card">
                    <div class="career-header">
                        <h3 class="career-title">${rec.title}</h3>
                        <div class="match-badge">
                            <span>${rec.matchPercentage}%</span>
                            <small>Match</small>
                        </div>
                    </div>
                    <p style="margin-bottom: 10px; font-size: 14px;">${rec.description}</p>
                    
                    <div class="career-details">
                        <p><strong>CBE Subjects:</strong> ${Array.isArray(rec.requiredSubjects) ? rec.requiredSubjects.join(', ') : rec.requiredSubjects || 'N/A'}</p>
                        <p><strong>Education:</strong> ${Array.isArray(rec.universities) ? rec.universities.join(', ') : rec.education || 'N/A'}</p>
                        <p><strong>Salary Range:</strong> ${rec.salaryRange}</p>
                        <p><strong>Actionability:</strong> ${rec.actionabilityScore || 'High'}/100</p>
                    </div>

                    <div class="why-recommended">
                        <strong>Why this fits you:</strong> ${rec.whyRecommended || 'Aligns strongly with your RIASEC profile and subject strengths.'}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Student Data Reference (Moved down so it's not the first thing they see) -->
        <div class="section" style="margin-top: 40px; border-top: 1px dashed var(--border); padding-top: 30px;">
            <h2 class="section-title" style="font-size: 16px; color: var(--muted);">Data Reference</h2>
            <div class="profile-grid">
                ${profile.subjects?.length ? `
                <div class="profile-item">
                    <div class="profile-label">Subjects Selected</div>
                    <div class="profile-value">${profile.subjects.join(', ')}</div>
                </div>
                ` : ''}
                ${profile.interests?.length ? `
                <div class="profile-item">
                    <div class="profile-label">Interests & RIASEC</div>
                    <div class="profile-value">${profile.interests.join(', ')}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Next Steps Section -->
        <div class="section">
            <h2 class="section-title">Recommended Next Steps</h2>
            <div class="next-steps">
                ${ReportGenerator.extractNextSteps(conversation)}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>CareerGuide AI</strong> - Empowering Kenya's Students Through CBE</p>
            <p>Visit <strong>${typeof window !== 'undefined' ? window.location.origin : 'careerguideai.com'}</strong> to continue your career journey</p>
            <p><em>This report is generated by AI and should be used as guidance alongside professional career counseling.</em></p>
            <p style="margin-top: 15px; font-size: 11px; color: #94a3b8;">
                Report generated on ${currentDate} | CareerGuide AI v1.0 | Kenya CBE System
            </p>
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
