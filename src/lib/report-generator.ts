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
  kcseGrade?: string;
  kcsePoints?: number;
  clusterSubjects?: string[];
  subjectGrades?: Record<string, string>;
}

export interface CareerRecommendation {
  title: string;
  matchPercentage: number;
  description: string;
  universities: string[];
  salaryRange: string;
  education?: string;
  actionabilityScore?: number;
  whyRecommended?: string;
  estimatedClusterPoints?: number;
  kuccpsCluster?: string;
  isTechnicalMisfit?: boolean;
  reasoning?: string;
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

    const colors = {
      primary: '#2563eb', 
      secondary: '#0f172a',
      accent: '#7c3aed',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      text: '#1e293b',
      muted: '#64748b',
      light: '#f8fafc',
      white: '#ffffff',
      border: '#e2e8f0'
    };

    const styles = this.getStyles(colors);

    return `
      <div class="report-container">
        <style>${styles}</style>
        <div class="report-page">
            <!-- HEADER -->
            <div class="header">
                <div class="branding">
                    <img src="${window.location.origin}/logos/CareerGuide_Logo.webp" class="logo" alt="CareerGuide">
                </div>
                <div class="meta">
                    <div class="report-label">Professional Career Diagnostic</div>
                    <div class="report-id">REF: ${reportId}</div>
                    <div class="report-date">${currentDate}</div>
                </div>
            </div>

            <!-- ASSESSMENT SUMMARY -->
            <div class="section-title">Diagnostic Summary</div>
            <div class="summary-box">
                ${this.extractAISummary(profile.aiSummary || conversation)}
            </div>

            <div class="section-title">Candidate Profile</div>
            <div class="grid">
                <div class="card">
                    <div class="card-label">Student Name</div>
                    <div class="card-value">${profile.name || 'Student Candidate'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Personality Blend (RIASEC)</div>
                    <div class="card-value">${profile.interests?.[0]?.replace('RIASEC Type: ', '') || 'Analytical & Strategic'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Strategic Archetype (MBTI)</div>
                    <div class="card-value">${profile.mbti || 'Analyzer'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Core Values</div>
                    <div class="card-value">${profile.values && profile.values.length > 0 ? profile.values.slice(0, 3).join(', ') : 'Growth, Innovation'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Current Academic Level</div>
                    <div class="card-value">${profile.grade || 'Senior Secondary'}</div>
                </div>
            </div>

            <div class="section-title">Academic Synchronization</div>
            <div class="grid">
                <div class="card">
                    <div class="card-label">Curriculum System</div>
                    <div class="card-value">${profile.curriculum === 'cbc' ? 'Kenyan CBC' : profile.curriculum === 'igcse' ? 'IGCSE/A-Level' : 'Kenyan 8-4-4 (Legacy)'}</div>
                </div>
                <div class="card">
                    <div class="card-label">KCSE Mean Grade</div>
                    <div class="card-value">${profile.kcseGrade || 'Assessment Only'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Aggregate Performance</div>
                    <div class="card-value">${profile.kcsePoints ? `${profile.kcsePoints} Points` : '---'}</div>
                </div>
                <div class="card">
                    <div class="card-label">Technical Eligibility</div>
                    <div class="card-value">${profile.resultsVerified ? 'Verified Official' : 'Self-Reported'}</div>
                </div>
            </div>

            <div class="page-break"></div>

            <div class="section-title">Institutional Placement Roadmap</div>
            <p style="font-size: 11px; color: ${colors.muted}; margin-bottom: 20px;">
                The following recommendations are triangulated using official 2025 KUCCPS cluster requirements and market performance trends.
            </p>

            ${recommendations.length > 0 ? recommendations.map(rec => `
                <div class="rec-card">
                    <div class="rec-header">
                        <div class="rec-title">${rec.title}</div>
                        ${rec.isTechnicalMisfit ? 
                            `<div class="misfit-badge">Technical Misfit</div>` : 
                            `<div class="match-badge">${rec.matchPercentage}% Alignment</div>`
                        }
                    </div>
                    
                    <p style="margin-bottom: 12px; color: ${colors.text}; font-size: 12px;">${rec.description}</p>
                    
                    <div class="rec-info-grid">
                        <div class="info-pill">
                            <div class="pill-label">KUCCPS Cluster</div>
                            <div class="pill-value">${rec.kuccpsCluster || 'General'}</div>
                        </div>
                        <div class="info-pill">
                            <div class="pill-label">Est. Cluster Points</div>
                            <div class="pill-value">${rec.estimatedClusterPoints || '22.0+'}</div>
                        </div>
                        <div class="info-pill">
                            <div class="pill-label">Path Index</div>
                            <div class="pill-value">${rec.actionabilityScore || 85}/100</div>
                        </div>
                    </div>

                    <div class="inst-box">
                        <div class="inst-label">Strategic Institutional Matches:</div>
                        <div class="inst-list">${rec.universities && rec.universities.length > 0 ? rec.universities.join(' • ') : 'Major Public & Private Universities'}</div>
                    </div>

                    ${rec.isTechnicalMisfit ? `
                        <div class="misfit-box">
                            <strong style="color: ${colors.danger}; font-size: 10px; text-transform: uppercase;">Admissions Alert:</strong>
                            <p style="font-size: 11px; margin-top: 2px;">${rec.reasoning}</p>
                        </div>
                    ` : `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                            <strong style="font-size: 10px; color: ${colors.muted}; text-transform: uppercase;">Why Recommended:</strong>
                            <p style="font-size: 11px; margin-top: 2px; color: ${colors.text};">${rec.whyRecommended || 'Aligns with student academic strengths and personality archetype.'}</p>
                        </div>
                    `}
                </div>
            `).join('') : `
                <div class="card" style="padding: 40px; text-align: center; border-style: dashed; background: #fffbeb;">
                    <strong style="color: #92400e; display: block; margin-bottom: 8px;">Academic Analysis in Progress</strong>
                    <p style="color: #b45309; font-size: 12px;">Your RIASEC profile and academic scores are being synchronized. If recommendations don't appear shortly, please re-run the assessment or check your connection.</p>
                </div>
            `}

            <div class="footer">
                <p><strong>Professional Career Diagnostic</strong> • CareerGuide AI • 2026 Edition</p>
                <p style="margin-top: 4px;">This roadmap is generated using "Realistic Triangulation Logic" for academic and career synchronization.</p>
            </div>
        </div>
      </div>
    `;
  }

  private static getStyles(colors: any): string {
    return `
        /* Font is preloaded via <link> tag in downloadPDF(). Do NOT use @import here — 
           it is unreliable inside innerHTML-injected <style> tags and causes blank PDFs. */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .report-container { 
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          color: ${colors.text}; 
          background: ${colors.white}; 
          line-height: 1.5;
          font-size: 13px;
          -webkit-font-smoothing: antialiased;
        }
        .report-page { width: 800px; margin: 0 auto; padding: 30px 40px; background: ${colors.white}; }
        
        /* HEADER */
        .header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid ${colors.primary}; padding-bottom: 15px; margin-bottom: 20px;
        }
        .branding { display: flex; align-items: center; gap: 12px; }
        .logo { height: 40px; width: auto; object-fit: contain; }
        .meta { text-align: right; }
        .report-label { text-transform: uppercase; font-size: 10px; font-weight: 700; color: ${colors.muted}; letter-spacing: 1px; }
        .report-id { font-size: 16px; font-weight: 700; color: ${colors.secondary}; }
        .report-date { font-size: 12px; color: ${colors.muted}; }

        /* SECTIONS */
        .section-title { 
          font-size: 14px; font-weight: 800; color: ${colors.secondary}; 
          margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;
          text-transform: uppercase; letter-spacing: 0.5px;
          page-break-after: avoid;
        }
        .section-title::before { content: ''; display: block; width: 4px; height: 16px; background: ${colors.primary}; border-radius: 2px; }

        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
        .card { padding: 10px 15px; border-radius: 12px; border: 1px solid ${colors.border}; background: ${colors.light}; page-break-inside: avoid; break-inside: avoid; }
        .card-label { font-size: 9px; font-weight: 700; color: ${colors.muted}; text-transform: uppercase; margin-bottom: 2px; }
        .card-value { font-size: 12px; font-weight: 600; color: ${colors.secondary}; }

        /* RECOMMENDATIONS */
        .rec-card { 
          margin-bottom: 12px; padding: 15px; border-radius: 12px; 
          border: 1px solid ${colors.border}; background: ${colors.white};
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          page-break-inside: avoid; break-inside: avoid;
        }
        .rec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .rec-title { font-size: 16px; font-weight: 800; color: ${colors.primary}; }
        .match-badge { 
          padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 10px; 
          background: ${colors.primary}; color: white; 
        }
        .misfit-badge { background: ${colors.danger}; color: white; padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 10px; }

        .rec-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
        .info-pill { padding: 6px; background: ${colors.light}; border-radius: 8px; text-align: center; border: 1px solid ${colors.border}; }
        .pill-label { font-size: 8px; color: ${colors.muted}; text-transform: uppercase; font-weight: 700; }
        .pill-value { font-size: 11px; font-weight: 600; color: ${colors.secondary}; }

        .inst-box { margin-bottom: 8px; padding: 8px; background: rgba(37, 99, 235, 0.03); border-radius: 8px; border: 1px dashed ${colors.primary}; page-break-inside: avoid; break-inside: avoid; }
        .inst-label { font-size: 9px; color: ${colors.primary}; text-transform: uppercase; font-weight: 800; }
        .inst-list { font-weight: 600; font-size: 11px; margin-top: 2px; color: ${colors.secondary}; }

        .misfit-box { padding: 8px; background: rgba(239, 68, 68, 0.05); border-left: 3px solid ${colors.danger}; border-radius: 4px; margin-top: 8px; page-break-inside: avoid; break-inside: avoid; }
        
        .summary-box { padding: 15px; border-radius: 12px; background: ${colors.light}; border: 1px solid ${colors.border}; font-size: 12px; line-height: 1.6; margin-bottom: 15px; page-break-inside: avoid; break-inside: avoid; }
        .summary-box p { margin-bottom: 8px; }
        .summary-box p:last-child { margin-bottom: 0; }
        .summary-box ul { margin-left: 20px; margin-bottom: 8px; }

        .footer { 
          margin-top: 30px; padding-top: 15px; border-top: 1px solid ${colors.border}; 
          text-align: center; font-size: 10px; color: ${colors.muted}; 
          page-break-inside: avoid; break-inside: avoid;
        }
        .page-break { page-break-before: always; }
    `;
  }

  static extractAISummary(input: string | ChatMessage[]): string {
    let summary = '';
    
    if (typeof input === 'string') {
        summary = input;
    } else {
        const assistantMsgs = input.filter(m => m.role === 'assistant').map(m => m.content);
        if (assistantMsgs.length === 0) return '<p>No diagnostic summary available. Re-run assessment to generate analysis.</p>';
        summary = assistantMsgs.reverse().find(t => (t || '').length > 100) || assistantMsgs[0] || '';
    }

    if (!summary || summary.length < 10) {
        return '<p>Analysis complete. Recommended careers reflect your academic strengths, RIASEC profile, and professional values.</p>';
    }

    const formatted = summary
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split(/\n{2,}/)
      .map(paragraph => {
        const lines = paragraph.split('\n').filter(l => l.trim());
        const isList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || l.trim().match(/^\d+\./));
        
        if (isList) {
          const listItems = lines.map(l => {
            const content = l.trim().replace(/^[-*]\s+|\d+\.\s+/, '');
            return `<li>${content}</li>`;
          }).join('');
          return `<ul>${listItems}</ul>`;
        }
        
        return `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return formatted;
  }

  static async downloadPDF(htmlContent: string, filename: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;
    
    const safeFilename = (filename || 'CareerGuide-Diagnostic.pdf')
      .replace(/[^a-z0-9. -]/gi, '_');

    // Wrap the report HTML in a container with explicit dimensions and white bg.
    // The wrapper ensures html2pdf.js knows the exact render width.
    const wrappedHtml = `<div style="width:800px;background:#ffffff;padding:0;margin:0;">${htmlContent}</div>`;

    const options: any = {
      margin: [5, 5, 5, 5],
      filename: safeFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        width: 800,
        windowWidth: 800,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Pass the HTML string directly to html2pdf.js.
    // html2pdf.js creates and manages its own internal container element.
    // This is the documented reliable approach - manual container creation
    // causes blank PDFs due to html2canvas positioning/visibility issues.
    await html2pdf()
      .from(wrappedHtml)
      .set(options)
      .save();
  }

  static generateTextReport(profile: GuestProfile, conversation: ChatMessage[]): string {
    const currentDate = new Date().toLocaleDateString();
    return `
CAREERGUIDE AI - PROFESSIONAL DIAGNOSTIC
Generated on: ${currentDate}

STUDENT NAME: ${profile.name || 'Student'}
CURRICULUM: ${profile.curriculum || 'Kenyan'}
MEAN GRADE: ${profile.kcseGrade || 'N/A'}

DIAGNOSTIC INSIGHTS:
${this.extractAISummary(conversation).replace(/<\/?[^>]+(>|$)/g, "")}

NEXT STEPS:
1. Verify Cluster Points against KUCCPS 2025 thresholds.
2. Direct application to recommended institutions.
3. Consult professional development roadmap on CareerGuide AI.

Empowering Kenya's Students Through AI-Driven Success.
    `;
  }

  static getCBEPathInfo(grade?: string): string {
    if (!grade) return "Determining pathway...";
    const gradeNum = parseInt(grade.replace(/\D/g, ''));
    if (grade.toLowerCase().includes('form') || grade.toLowerCase().includes('kcse')) return "Tertiary Readiness (KUCCPS)";
    if (gradeNum <= 9) return "Junior Secondary (Exploring Areas)";
    return "Senior Secondary (Pathway Specialization)";
  }
}
