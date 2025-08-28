import { ChatMessage } from './ai-service';

export interface GuestProfile {
  name?: string;
  age?: string;
  grade?: string;
  subjects?: string[];
  interests?: string[];
  careerGoals?: string;
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
    <title>CareerPath AI Assessment Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .report-container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #667eea; 
            font-size: 2.5em; 
            margin: 0; 
            font-weight: 700;
        }
        .header p { 
            color: #666; 
            font-size: 1.1em; 
            margin: 10px 0 0 0; 
        }
        .section { 
            margin: 30px 0; 
            padding: 20px; 
            background: #f8f9ff; 
            border-radius: 10px; 
            border-left: 5px solid #667eea;
        }
        .section h2 { 
            color: #667eea; 
            font-size: 1.5em; 
            margin-top: 0; 
            display: flex;
            align-items: center;
        }
        .section h2::before {
            content: "🎯";
            margin-right: 10px;
        }
        .profile-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 15px 0; 
        }
        .profile-item { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            border: 1px solid #e0e6ff;
        }
        .profile-item strong { 
            color: #667eea; 
            display: block; 
            margin-bottom: 5px; 
        }
        .recommendation { 
            background: white; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 10px; 
            border: 1px solid #e0e6ff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .recommendation h3 { 
            color: #667eea; 
            margin-top: 0; 
            font-size: 1.3em;
        }
        .match-percentage { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 5px 15px; 
            border-radius: 20px; 
            font-weight: bold; 
            display: inline-block; 
            margin-bottom: 10px;
        }
        .conversation-summary { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 10px 0; 
            border-left: 4px solid #667eea;
        }
        .next-steps { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 25px; 
            border-radius: 10px; 
            margin-top: 30px;
        }
        .next-steps h2 { 
            color: white; 
            margin-top: 0; 
        }
        .next-steps ul { 
            list-style: none; 
            padding: 0; 
        }
        .next-steps li { 
            padding: 8px 0; 
            padding-left: 25px; 
            position: relative;
        }
        .next-steps li::before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #4ade80; 
            font-weight: bold; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e0e6ff; 
            color: #666; 
        }
        .cbe-info {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .cbe-info h3 {
            color: white;
            margin-top: 0;
        }
        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>🎓 CareerPath AI Assessment Report</h1>
            <p>Personalized Career Guidance for Kenya's CBE System</p>
            <p><strong>Generated:</strong> ${currentDate}</p>
        </div>

        <div class="section">
            <h2>Student Profile</h2>
            <div class="profile-grid">
                ${profile.name ? `<div class="profile-item"><strong>Name:</strong> ${profile.name}</div>` : ''}
                ${profile.grade ? `<div class="profile-item"><strong>Current Grade:</strong> ${profile.grade}</div>` : ''}
                ${profile.age ? `<div class="profile-item"><strong>Age:</strong> ${profile.age}</div>` : ''}
                ${profile.location ? `<div class="profile-item"><strong>Location:</strong> ${profile.location}</div>` : ''}
            </div>
            
            ${profile.subjects?.length ? `
            <div class="profile-item">
                <strong>CBE Subjects:</strong> ${profile.subjects.join(', ')}
            </div>
            ` : ''}
            
            ${profile.interests?.length ? `
            <div class="profile-item">
                <strong>Career Interests:</strong> ${profile.interests.join(', ')}
            </div>
            ` : ''}
            
            ${profile.careerGoals ? `
            <div class="profile-item">
                <strong>Career Goals:</strong> ${profile.careerGoals}
            </div>
            ` : ''}
        </div>

        <div class="cbe-info">
            <h3>🇰🇪 Kenya's CBE System Overview</h3>
            <p><strong>Your Current Path:</strong> ${this.getCBEPathInfo(profile.grade)}</p>
            <p><strong>Next Steps:</strong> ${this.getNextSteps(profile.grade)}</p>
        </div>

        ${recommendations.length > 0 ? `
        <div class="section">
            <h2>Career Recommendations</h2>
            ${recommendations.map(rec => `
                <div class="recommendation">
                    <div class="match-percentage">${rec.matchPercentage}% Match</div>
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <p><strong>Required CBE Subjects:</strong> ${rec.requiredSubjects.join(', ')}</p>
                    <p><strong>Kenyan Universities:</strong> ${rec.universities.join(', ')}</p>
                    <p><strong>Salary Range:</strong> ${rec.salaryRange}</p>
                    <p><strong>Job Outlook:</strong> ${rec.jobOutlook}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>Assessment Summary</h2>
            ${conversation.filter(msg => msg.role === 'user').slice(0, 5).map((msg, index) => `
                <div class="conversation-summary">
                    <strong>Q${index + 1}:</strong> ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}
                </div>
            `).join('')}
        </div>

        <div class="next-steps">
            <h2>🚀 Your Next Steps</h2>
            <ul>
                <li>Create a full CareerPath AI account for detailed assessments</li>
                <li>Explore CBE pathway options for your grade level</li>
                <li>Research recommended universities and their admission requirements</li>
                <li>Connect with career counselors for personalized guidance</li>
                <li>Take practice assessments to improve your academic performance</li>
                <li>Join career-focused extracurricular activities</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>CareerPath AI</strong> - Empowering Kenya's Students Through CBE</p>
            <p>Visit <strong>${window.location.origin}</strong> to continue your career journey</p>
            <p><em>This report is generated by AI and should be used as guidance alongside professional career counseling.</em></p>
        </div>
    </div>
</body>
</html>
    `;
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

  static generateTextReport(profile: GuestProfile, conversation: ChatMessage[]): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
CAREERPATH AI - QUICK ASSESSMENT REPORT
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
1. Create your full profile at CareerPath AI
2. Take comprehensive CBE-aligned assessments
3. Explore university programs matching your interests
4. Connect with career counselors for personalized guidance
5. Research scholarship opportunities in Kenya
6. Join relevant extracurricular activities

Visit: ${window.location.origin} to continue your career journey!

---
This report is generated by AI and should be used as guidance alongside professional career counseling.
CareerPath AI - Empowering Kenya's Students Through CBE
    `;
  }
}
