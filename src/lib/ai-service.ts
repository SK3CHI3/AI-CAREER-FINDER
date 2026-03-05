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

    console.log('AI Service initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length,
      modelName: this.modelName,
      baseUrl: this.baseUrl
    });

    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured. Please add VITE_DEEPSEEK_API_KEY to your environment variables.')
    }
  }

  private createSystemPrompt(userContext: UserContext): string {
    const assessment = userContext.assessmentResults;
    const riasec = assessment?.riasec_scores;
    const personality = assessment?.personality_type?.join(', ');
    const values = assessment?.values?.join(', ');

    const assessmentSection = assessment ? `
ASSESSMENT DATA:
${riasec ? `- RIASEC Personality: ${personality} (Scores: R:${riasec.realistic}, I:${riasec.investigative}, A:${riasec.artistic}, S:${riasec.social}, E:${riasec.enterprising}, C:${riasec.conventional})` : ''}
${values ? `- Core Values: ${values}` : ''}
` : '';

    const academicSection = userContext.academicPerformance ? `
ACADEMIC PERFORMANCE:
- Overall: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong in: ${userContext.academicPerformance.strongSubjects.join(', ')}
- Weak in: ${userContext.academicPerformance.weakSubjects.join(', ')}
` : '';

    return `You are CareerPath AI, Kenya's most advanced career counselor. Your mission is to provide personalized guidance using "Triangulation Logic"—balancing a student's Personality (RIASEC), Academic Performance, and Stated Interests.

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
2. Academic Performance: Align careers with their strong subjects. If a student wants a STEM career but is weak in Math, suggest bridging options or related technical paths.
3. Stated Interests: Respect their dreams, but use RIASEC and grades to refine which version of a career fits best (e.g., if they love Medicine but are artistic, suggest Medical Illustration or Psychology).

CONVERSATION STRUCTURE:
1. Greeting & Context - Acknowledge their assessment results if they exist.
2. Dynamic Exploration - Ask one question at a time to dive deeper into one of the three triangulation points.
3. CBE Pathway Mapping - Explain how their profile fits into STEM, Social Sciences, Arts, or Technical pathways.
4. Professional Recommendations - Provide 3 precise career matches based on all data.

FORMATTING RULES - NO MARKDOWN (** or ##):
- Clean, natural sentences with line breaks.
- Use emojis for warmth: "Habari yako, [Name]! 👋"
- Numbered options clearly: 1️⃣ Choice One
- Avoid robotic technical jargon; be like a mentor.

KENYAN CAREER CONTEXT:
- Vision 2030 priorities (Digital Superhighway, Affordable Housing, Healthcare, etc.).
- University vs. TVET (Technical College) options.
- Salary ranges in KES.

CRITICAL: Ask only ONE question per response. Be curious and empathetic. Wait for their answer before proceeding.`
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

      console.log('Making AI API call to:', `${this.baseUrl}/chat/completions`);
      console.log('API Key available:', !!this.apiKey);
      console.log('Request payload:', {
        model: this.modelName,
        messageCount: messages.length,
        temperature: 0.7,
        streaming: true
      });

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

  async generateCareerRecommendations(userContext: UserContext): Promise<any[]> {
    try {
      const assessmentInfo = userContext.assessmentResults ? `
Assessment Results:
- Personality (RIASEC): ${userContext.assessmentResults.personality_type?.join(', ') || 'Not assessed'}
- Core Values: ${userContext.assessmentResults.values?.join(', ') || 'Not assessed'}
` : ''

      const academicInfo = userContext.academicPerformance ? `
Academic Performance:
- Overall Average: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong Subjects: ${userContext.academicPerformance.strongSubjects.join(', ') || 'None identified'}
- Weak Subjects: ${userContext.academicPerformance.weakSubjects.join(', ') || 'None identified'}
- Performance Trend: ${userContext.academicPerformance.performanceTrend}
` : ''

      const prompt = `Generate 3 career recommendations for a Kenyan student using "Triangulation Logic" (Personality + Grades + Interests). Return ONLY a JSON array:

Profile: ${userContext.schoolLevel || 'Secondary'} student, Grade ${userContext.currentGrade || '10'}, Subjects: ${userContext.subjects?.slice(0, 3).join(', ') || 'Math, English, Science'}, Interests: ${userContext.interests?.slice(0, 2).join(', ') || 'Technology, Business'}
${assessmentInfo}
${academicInfo}

Instructions:
1. Prioritize careers that align with their top RIASEC personality types.
2. Ensure the careers are academically feasible based on their strong subjects.
3. Factor in their stated interests but prioritize the psychological fit (RIASEC).
4. For each career, explain "whyRecommended" using specific data points from their personality and grades.

Return exactly this format:
[{"title":"Career Name","matchPercentage":85,"description":"Short description","salaryRange":"KSh range","education":"Required path","whyRecommended":"Detailed explanation including RIASEC fit and subject alignment"}]`

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
