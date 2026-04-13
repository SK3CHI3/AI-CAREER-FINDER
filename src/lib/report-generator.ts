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

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Career Assessment Report - ${profile.name || 'Student'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: ${colors.text}; 
          background: ${colors.white}; 
          line-height: 1.6;
          font-size: 13px;
        }
        .report-page { width: 800px; margin: 0 auto; padding: 40px 50px; background: ${colors.white}; }
        
        /* HEADER */
        .header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid ${colors.primary}; padding-bottom: 20px; margin-bottom: 30px;
        }
        .branding { display: flex; align-items: center; gap: 12px; }
        .logo { height: 45px; width: auto; object-fit: contain; }
        .brand-name { font-weight: 800; font-size: 20px; color: ${colors.primary}; letter-spacing: -0.5px; }
        .meta { text-align: right; }
        .report-label { text-transform: uppercase; font-size: 10px; font-weight: 700; color: ${colors.muted}; letter-spacing: 1px; }
        .report-id { font-size: 16px; font-weight: 700; color: ${colors.secondary}; }
        .report-date { font-size: 12px; color: ${colors.muted}; }

        /* SECTIONS */
        .section-title { 
          font-size: 15px; font-weight: 800; color: ${colors.secondary}; 
          margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .section-title::before { content: ''; display: block; width: 4px; height: 16px; background: ${colors.primary}; border-radius: 2px; }

        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
        .card { padding: 12px 15px; border-radius: 12px; border: 1px solid ${colors.border}; background: ${colors.light}; }
        .card-label { font-size: 9px; font-weight: 700; color: ${colors.muted}; text-transform: uppercase; margin-bottom: 2px; }
        .card-value { font-size: 13px; font-weight: 600; color: ${colors.secondary}; }

        /* RECOMMENDATIONS */
        .rec-card { 
          margin-bottom: 15px; padding: 18px; border-radius: 16px; 
          border: 1px solid ${colors.border}; background: ${colors.white};
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
        }
        .rec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .rec-title { font-size: 17px; font-weight: 800; color: ${colors.primary}; }
        .match-badge { 
          padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 10px; 
          background: ${colors.primary}; color: white; 
        }
        .misfit-badge { background: ${colors.danger}; color: white; padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 10px; }

        .rec-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
        .info-pill { padding: 8px; background: ${colors.light}; border-radius: 8px; text-align: center; border: 1px solid ${colors.border}; }
        .pill-label { font-size: 8px; color: ${colors.muted}; text-transform: uppercase; font-weight: 700; }
        .pill-value { font-size: 11px; font-weight: 600; color: ${colors.secondary}; }

        .inst-box { margin-bottom: 10px; padding: 10px; background: rgba(37, 99, 235, 0.03); border-radius: 8px; border: 1px dashed ${colors.primary}; }
        .inst-label { font-size: 9px; color: ${colors.primary}; text-transform: uppercase; font-weight: 800; }
        .inst-list { font-weight: 600; font-size: 11px; margin-top: 3px; color: ${colors.secondary}; }

        .misfit-box { padding: 10px; background: rgba(239, 68, 68, 0.05); border-left: 3px solid ${colors.danger}; border-radius: 4px; margin-top: 8px; }
        
        .summary-box { padding: 18px; border-radius: 12px; background: ${colors.light}; border: 1px solid ${colors.border}; font-size: 12px; line-height: 1.7; }
        .summary-box p { margin-bottom: 10px; }
        .summary-box ul { margin-left: 20px; margin-bottom: 10px; }

        .footer { 
          margin-top: 40px; padding-top: 20px; border-top: 1px solid ${colors.border}; 
          text-align: center; font-size: 10px; color: ${colors.muted}; 
        }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="report-page">
        <!-- HEADER -->
        <div class="header">
            <div class="branding">
                <img src="${window.location.origin}/logos/CareerGuide_Logo.webp" class="logo" alt="CareerGuide">
                <span class="brand-name">CareerGuide AI</span>
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
            ${this.extractAISummary(conversation)}
        </div>

        <div class="section-title">Candidate Profile</div>
        <div class="grid">
            <div class="card">
                <div class="card-label">Personality Blend (RIASEC)</div>
                <div class="card-value">${profile.interests?.[0]?.replace('RIASEC Type: ', '') || 'Dynamic Profile'}</div>
            </div>
            <div class="card">
                <div class="card-label">Strategic Archetype (MBTI)</div>
                <div class="card-value">${profile.mbti || 'Analyzer'}</div>
            </div>
            <div class="card">
                <div class="card-label">Core Values</div>
                <div class="card-value">${profile.values?.slice(0, 3).join(', ') || 'Growth, Innovation'}</div>
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
                <div class="card-value">${profile.curriculum === 'cbc' ? 'Kenyan CBC' : 'Kenyan 8-4-4 (Legacy)'}</div>
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

        ${recommendations.map(rec => `
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
                    <div class="inst-list">${rec.universities.join(' • ')}</div>
                </div>

                ${rec.isTechnicalMisfit ? `
                    <div class="misfit-box">
                        <strong style="color: ${colors.danger}; font-size: 10px; text-transform: uppercase;">Admissions Alert:</strong>
                        <p style="font-size: 11px; margin-top: 2px;">${rec.reasoning}</p>
                    </div>
                ` : `
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                        <strong style="font-size: 10px; color: ${colors.muted}; text-transform: uppercase;">Why Recommended:</strong>
                        <p style="font-size: 11px; margin-top: 2px; color: ${colors.text};">${rec.whyRecommended}</p>
                    </div>
                `}
            </div>
        `).join('')}

        <div class="footer">
            <p><strong>Professional Career Diagnostic</strong> • CareerGuide AI • 2026 Edition</p>
            <p style="margin-top: 4px;">This roadmap is generated using "Realistic Triangulation Logic" for academic and career synchronization.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static extractAISummary(conversation: ChatMessage[]): string {
    const assistantMsgs = conversation.filter(m => m.role === 'assistant').map(m => m.content);
    if (assistantMsgs.length === 0) return '<p>No diagnostic summary available.</p>';

    const summary = assistantMsgs.reverse().find(t => (t || '').length > 100) || assistantMsgs[0];

    const formatted = summary
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return `<li>${line.trim().substring(2)}</li>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');

    return formatted || '<p>Analysis complete. Key strengths identified in analytical and creative domains.</p>';
  }

  static async downloadPDF(htmlContent: string, filename: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    await html2pdf()
      .from(container)
      .set({
        margin: [5, 5, 5, 5],
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
CAREERGUIDE AI - PROFESSIONAL DIAGNOSTIC
Generated on: ${currentDate}

CANDIDATE: ${profile.name || 'Student'}
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
