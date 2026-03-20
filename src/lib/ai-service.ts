import { supabase } from './supabase'
import type { AIConversation, ChatMessage, UserProfile } from '../types/database'

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const MODEL_NAME = 'deepseek-chat' // Non-thinking mode of DeepSeek-V3.1

export type { ChatMessage } from '../types/database'

export interface UserContext {
  name?: string
  schoolLevel?: UserProfile['school_level']
  currentGrade?: string
  subjects?: string[]
  interests?: string[]
  careerGoals?: string
  assessmentResults?: UserProfile['assessment_results']
  constraints?: string[]
  previousRecommendations?: UserProfile['previous_recommendations']
  academicPerformance?: {
    overallAverage: number
    strongSubjects: string[]
    weakSubjects: string[]
    performanceTrend: 'improving' | 'declining' | 'stable'
  }
}

class AICareerService {
  private apiKey: string
  private modelName: string
  private baseUrl: string

  constructor() {
    this.apiKey = DEEPSEEK_API_KEY
    this.modelName = MODEL_NAME
    this.baseUrl = 'https://api.deepseek.com'

    if (import.meta.env.DEV) {
      console.log('AI Service initialized:', {
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey?.length,
        modelName: this.modelName,
        baseUrl: this.baseUrl
      });
    }

    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured. Please add VITE_DEEPSEEK_API_KEY to your environment variables.')
    }
  }

  private createSystemPrompt(userContext: UserContext): string {
    const assessment = userContext.assessmentResults;
    const riasec = assessment?.riasec_scores;
    const personality = assessment?.personality_type?.join(', ');
    const values = assessment?.values?.join(', ');
    const constraints = userContext.constraints?.join(', ') || assessment?.constraints?.join(', ');

    const assessmentSection = assessment ? `
ASSESSMENT DATA:
${riasec ? `- RIASEC Personality: ${personality} (Scores: R:${riasec.realistic}, I:${riasec.investigative}, A:${riasec.artistic}, S:${riasec.social}, E:${riasec.enterprising}, C:${riasec.conventional})` : ''}
${values ? `- Core Values: ${values}` : ''}
${constraints ? `- Real-world Constraints: ${constraints}` : ''}
` : '';

    const academicSection = userContext.academicPerformance ? `
ACADEMIC PERFORMANCE:
- Overall: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong in: ${userContext.academicPerformance.strongSubjects.join(', ')}
- Weak in: ${userContext.academicPerformance.weakSubjects.join(', ')}
` : '';

    return `You are CareerGuide AI, Kenya's most advanced career counselor. Your mission is to provide personalized, actionable guidance using "Realistic Triangulation Logic"—balancing a student's Personality (RIASEC), Academic Performance, Stated Interests, and Real-World Realities.

CURRENT USER PROFILE:
${userContext.name ? `- Name: ${userContext.name}` : '- Name: Not provided'}
${userContext.schoolLevel ? `- Education Level: ${userContext.schoolLevel}` : '- Education Level: Not specified'}
${userContext.currentGrade ? `- Current Grade: ${userContext.currentGrade}` : '- Current Grade: Not specified'}
${userContext.subjects?.length ? `- CBE Subjects: ${userContext.subjects.join(', ')}` : '- CBE Subjects: Not specified'}
${userContext.interests?.length ? `- Career Interests: ${userContext.interests.join(', ')}` : '- Career Interests: Not specified'}
${userContext.careerGoals ? `- Career Goals: ${userContext.careerGoals}` : '- Career Goals: Not specified'}
${assessmentSection}
${academicSection}

GUIDANCE LOGIC:
1. Personality (RIASEC): Holland Codes are the foundation. Recommend roles aligned with their top 2-3 RIASEC types.
2. Academic Performance: Align careers with their strong subjects. If a student wants a STEM career but is weak in Math, suggest technical pathways that leverage their other strengths or bridging options.
3. Personal Values: Factor in what matters to them (e.g., Autonomy, Impact, Income). If they value stability, avoid highly volatile freelance/startup-heavy paths unless they have a safety net.
4. Feasibility & Constraints: Respect constraints (Geography, Finance, Time). If they need remote work or scholarships, prioritize careers with high digital accessibility or available government/private funding in Kenya.
5. Labor Market Reality: Factor in Kenyan market demand (Vision 2030, tech boom, manufacturing needs, automation risk). Prioritize emerging fields in the Creative Economy (Content Creation, Digital Art) and the Digital Superhighway over saturated traditional roles.

CONVERSATION STRUCTURE:
1. Greeting & Context - Acknowledge their assessment results and core values.
2. Dynamic Exploration - Ask one question at a time to dive deeper into how their values conflict or align with their interests.
3. Actionable Coaching - Don't just list careers; provide the "Feasibility Score" for their goals.
4. Professional Recommendations - Provide 3 precise career matches based on all data. Ensure at least one recommendation is an emerging or unconventional role if it fits their RIASEC/Values.

FORMATTING RULES - NO MARKDOWN (** or ##):
- Clean, natural sentences with line breaks.
- Use emojis for warmth.
- Numbered options clearly.
- Avoid robotic technical jargon.

KENYAN CAREER CONTEXT:
- Vision 2030 priorities (Digital Superhighway, Affordable Housing, Healthcare, Creative Economy).
- Real-world demand vs. Degree prestige.
- The rise of the creator economy and digital entrepreneurship.
- Automation risk in traditional roles.

CRITICAL: Ask only ONE question per response. Be curious, realistic, and empathetic. Wait for their answer before proceeding.`
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    userContext: UserContext,
    retryCount = 0
  ): Promise<string> {
    const maxRetries = 2
    const retryDelay = 1000 * (retryCount + 1) // Exponential backoff

    try {
      const systemPrompt = this.createSystemPrompt(userContext)

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ]

      if (import.meta.env.DEV) {
        console.log('Making AI API call to:', `${this.baseUrl}/chat/completions`);
        console.log('API Key available:', !!this.apiKey);
        console.log('Request payload:', {
          model: this.modelName,
          messageCount: messages.length,
          temperature: 0.7,
          streaming: true
        });
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9,
          stream: true
        })
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('DeepSeek API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Specific handling for 402 Payment Required
        if (response.status === 402) {
          throw new Error('AI service billing issue (402). Please check DeepSeek API credits.')
        }
        
        throw new Error(`AI service error: ${response.status} - ${response.statusText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.choices?.[0]?.delta?.content) {
                  fullResponse += parsed.choices[0].delta.content
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      if (!fullResponse.trim()) {
        throw new Error('Empty response from AI service')
      }

      return fullResponse
    } catch (error) {
      console.error('AI Service Error:', error)

      // Retry logic for network errors
      if (retryCount < maxRetries && (
        (error instanceof TypeError && error.message.includes('Failed to fetch')) ||
        (error instanceof Error && error.message.includes('timeout'))
      )) {
        console.log(`Retrying AI request (attempt ${retryCount + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return this.sendMessage(message, conversationHistory, userContext, retryCount + 1)
      }

      // Handle specific network errors with user-friendly messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.')
      } else if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.')
      } else if (error instanceof Error && error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.')
      } else {
        throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  async generateTeacherInsights(userContext: UserContext): Promise<string> {
    try {
      const assessmentInfo = userContext.assessmentResults ? `
ASSESSMENT DATA:
- Personality (RIASEC): ${userContext.assessmentResults.personality_type?.join(', ') || 'Not assessed'}
- Core Values: ${userContext.assessmentResults.values?.join(', ') || 'Not assessed'}
- Constraints: ${userContext.assessmentResults.constraints?.join(', ') || 'None stated'}
` : ''

      const academicInfo = userContext.academicPerformance ? `
ACADEMIC PERFORMANCE:
- Overall Average: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong Subjects: ${userContext.academicPerformance.strongSubjects.join(', ') || 'None identified'}
- Weak Subjects: ${userContext.academicPerformance.weakSubjects.join(', ') || 'None identified'}
- Performance Trend: ${userContext.academicPerformance.performanceTrend}
` : ''

      const prompt = `You are a Senior Pedagogical Consultant & Career Mentor. Your task is to provide a Teacher with specific, actionable guidance strategies for a student named ${userContext.name || 'this student'}.

STUDENT PROFILE:
${userContext.schoolLevel ? `- Level: ${userContext.schoolLevel}` : ''} ${userContext.currentGrade ? `(Grade ${userContext.currentGrade})` : ''}
- Career Interests: ${userContext.interests?.join(', ') || 'Not specified'}
${assessmentInfo}
${academicInfo}

TASK:
Provide a strategic "Teacher Guidance Report" that is realistic and tactical.

STRUCTURE YOUR RESPONSE IN THESE SECTIONS (NO MARKDOWN ** or ##):

1. STUDENT TRIANGULATION SUMMARY
A one-sentence summary of who this student is based on the intersection of their personality, academics, and practical constraints.

2. PEDAGOGICAL TACTICS
Provide 3 concrete classroom or school-level actions the teacher can take to support this student's specific career trajectory.
If they are weak in a subject core to their goal, suggest a specific remedial approach.
If they have financial/geographical constraints, suggest specific resources (TVET, bursaries, digital skills).

3. MENTORSHIP TALKING POINTS
Provide 2-3 specific questions or topics the teacher should bring up in a 1-on-1 mentorship session.

4. REAL-WORLD REALITY CHECK
Highlight one major opportunity or hurdle the teacher should prepare the student for (e.g., automation risk, market demand in Kenya).

FORMATTING:
- Use clear headings in ALL CAPS.
- No markdown bolding or subheadings.
- Use emojis for readability.
- Keep sentences professional but warm.`

      const response = await this.sendMessage(prompt, [], userContext)
      return response
    } catch (error) {
      console.error('Failed to generate teacher insights:', error)
      return "I'm sorry, I couldn't generate insights for this student right now. Please check if the student has completed their profile and grades are uploaded."
    }
  }

  async generateCareerRecommendations(userContext: UserContext): Promise<any[]> {
    try {
      const assessmentInfo = userContext.assessmentResults ? `
Assessment Results:
- Personality (RIASEC): ${userContext.assessmentResults.personality_type?.join(', ') || 'Not assessed'}
- Core Values: ${userContext.assessmentResults.values?.join(', ') || 'Not assessed'}
- Constraints: ${userContext.assessmentResults.constraints?.join(', ') || 'None stated'}
` : ''

      const academicInfo = userContext.academicPerformance ? `
Academic Performance:
- Overall Average: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong Subjects: ${userContext.academicPerformance.strongSubjects.join(', ') || 'None identified'}
- Weak Subjects: ${userContext.academicPerformance.weakSubjects.join(', ') || 'None identified'}
- Performance Trend: ${userContext.academicPerformance.performanceTrend}
` : ''

      const prompt = `Generate 3 career recommendations for a Kenyan student using "Realistic Triangulation Logic" (Personality + Grades + Interests + Values + Constraints + Market Reality). Return ONLY a JSON array:

Profile: ${userContext.schoolLevel || 'Secondary'} student, Grade ${userContext.currentGrade || '10'}, Subjects: ${userContext.subjects?.slice(0, 3).join(', ') || 'Math, English, Science'}, Interests: ${userContext.interests?.slice(0, 2).join(', ') || 'Technology, Business'}
${assessmentInfo}
${academicInfo}

Instructions:
1. High Value Fit: Ensure the career matches their core values (e.g., stability vs. autonomy).
2. Feasibility Check: Filter careers based on constraints (e.g., if they need scholarships, prioritize TVET or high-grant fields).
3. Market Reality: Recommend careers with strong growth in Kenya (Vision 2030 pillars), explicitly including the Creative Economy (Content Creation, Digital Art) and the Digital Superhighway.
4. Growth Trajectory: Evaluate if the career offers long-term growth and transition paths as the person evolves. Avoid overly traditional, saturated roles.
5. For each career, explain "whyRecommended" by explaining the specific alignment with their RIASEC types AND their core values.
6. Provide an "actionabilityScore" (1-100) reflecting how easily they can pursue this given their constraints.

Return exactly this format:
[{"title":"Career Name","matchPercentage":85,"actionabilityScore":90,"description":"Short description","salaryRange":"KSh range","education":"Required path","whyRecommended":"Detailed explanation including RIASEC fit, Value alignment, Growth Trajectory, and Market feasibility"}]`

      const response = await this.sendMessage(prompt, [], userContext)

      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*?\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          // Validate the structure
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && parsed[0].matchPercentage) {
            return parsed
          }
        }

        // Fallback recommendations based on profile and academic performance
        return this.getFallbackRecommendations(userContext)
      } catch (parseError) {
        console.error('Failed to parse career recommendations:', parseError)
        return this.getFallbackRecommendations(userContext)
      }
    } catch (error) {
      console.error('Failed to generate career recommendations:', error)
      return this.getFallbackRecommendations(userContext)
    }
  }

  async getTrendingCareers(): Promise<any[]> {
    try {
      const prompt = `CRITICAL: Return ONLY a valid JSON array of objects. No markdown, no backticks, no text.
      
      Structure:
      [{"title":"...","category":"...","demand_level":"...","salary_range":"...","growth_percentage":"...","skills_required":[],"description":"...","education_requirements":"...","career_level":"..."}]
      
      Constraints:
      - exactly 15 items
      - demand_level: "Very High" | "High" | "Growing" | "Emerging"
      - career_level: "entry" | "mid" | "senior"
      - Be specific to Kenya.`;

      const response = await this.sendMessage(prompt, [], {});
      
      return this.parseAndRepairJson(response);
    } catch (error) {
      console.error('Failed to get trending careers from AI:', error);
      throw error;
    }
  }

  private parseAndRepairJson(content: string): any[] {
    // 1. Clean the response: remove any potential markdown code blocks
    let cleaned = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 2. Extract the array part
    const jsonMatch = cleaned.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response');
    }

    let jsonString = jsonMatch[0];

    try {
      // Try standard parse first
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn('Initial JSON parse failed, attempting repair...', e);
    }

    // 3. Robust Repair Steps
    try {
      // Fix common LLM errors in multiple passes
      let repaired = jsonString;
      
      // Pass 1: Simple syntax fixes
      repaired = repaired
        .replace(/,\s*([\]}])/g, '$1') // Trailing commas
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Unquoted keys
        .replace(/"\s+([a-zA-Z0-9_]+)":/g, '", "$1":'); // Missing commas between props

      // Pass 2: Handle unescaped internal quotes and newlines more aggressively
      // We look for the start of a value after a colon and try to find the actual end quote
      repaired = repaired.replace(/:\s*"([\s\S]*?)"(?=\s*[,}\]])/g, (match, p1) => {
        // If there are internal quotes that aren't escaped, escape them
        const fixed = p1
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/(?<!\\)"/g, '\\"');
        return `: "${fixed}"`;
      });
      
      // Pass 3: Fix missing commas between objects in array
      repaired = repaired.replace(/}\s*{/g, '}, {');

      // Pass 4: Fix unescaped characters that are common
      repaired = repaired.replace(/[\u0000-\u0019]+/g, "");

      try {
        const parsed = JSON.parse(repaired);
        if (Array.isArray(parsed)) return parsed;
      } catch (innerError) {
        console.warn('Advanced repair pass failed. Raw snippet near error:', repaired.substring(Math.max(0, (innerError as any).pos - 50), (innerError as any).pos + 50));
        
        // Pass 5: Extreme cleanup
        repaired = repaired.replace(/"\s*,\s*"/g, '", "');
      }

      const ultraClean = repaired
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
        .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\"); // Fix invalid escapes
      
      return JSON.parse(ultraClean);
    } catch (repairError) {
      console.error('All JSON repair attempts failed. Raw content length:', jsonString.length);
      console.error('JSON string at failure:', jsonString);
      throw new Error(`JSON parsing failed: ${repairError instanceof Error ? repairError.message : String(repairError)}`);
    }
  }

  private getFallbackRecommendations(userContext: UserContext): any[] {
    // Return empty array to force dynamic generation
    return [];
  }

  // Note: Conversations are now stored in localStorage only (not in database)
  // This prevents unnecessary database queries and 404 errors
  async saveConversation(userId: string, messages: ChatMessage[]): Promise<void> {
    // Conversations are stored in localStorage only
    // No database storage to prevent 404 errors
    console.log('Conversation saved to localStorage only')
  }

  async loadConversationHistory(userId: string): Promise<ChatMessage[]> {
    // Conversations are loaded from localStorage only
    // No database queries to prevent 404 errors
    return []
  }

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
          stream: false
        })
      });

      console.log('Connection test response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const aiCareerService = new AICareerService()
