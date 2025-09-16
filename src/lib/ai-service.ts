import { supabase } from './supabase'
import type { AIConversation, ChatMessage, UserProfile } from '../types/database'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL_NAME = 'deepseek/deepseek-r1:free'

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
    this.apiKey = OPENROUTER_API_KEY
    this.modelName = MODEL_NAME
    this.baseUrl = 'https://openrouter.ai/api/v1'

    console.log('AI Service initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length,
      modelName: this.modelName,
      baseUrl: this.baseUrl
    });

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.')
    }
  }

  private createSystemPrompt(userContext: UserContext): string {
    return `You are CareerPath AI, Kenya's friendliest career counselor specializing in the CBE curriculum. Your mission is to guide students through a structured, engaging conversation to discover their perfect career path.

CURRENT USER PROFILE:
${userContext.name ? `- Name: ${userContext.name}` : '- Name: Not provided'}
${userContext.schoolLevel ? `- Education Level: ${userContext.schoolLevel}` : '- Education Level: Not specified'}
${userContext.currentGrade ? `- Current Grade: ${userContext.currentGrade}` : '- Current Grade: Not specified'}
${userContext.subjects?.length ? `- CBE Subjects: ${userContext.subjects.join(', ')}` : '- CBE Subjects: Not specified'}
${userContext.interests?.length ? `- Career Interests: ${userContext.interests.join(', ')}` : '- Career Interests: Not specified'}
${userContext.careerGoals ? `- Career Goals: ${userContext.careerGoals}` : '- Career Goals: Not specified'}

CONVERSATION STRUCTURE - ASK ONE QUESTION AT A TIME:
1. **Greeting & Name** - Start with "Karibu!" and get their name
2. **Education Level** - What grade/level are they in? (Use CBE structure)
3. **Interests Discovery** - What activities/fields excite them most?
4. **Subject Preferences** - Which CBE subjects do they enjoy?
5. **Work Style** - Practical vs Academic vs Creative vs Business?
6. **Environment Preference** - Office, Outdoor, Technical, Digital?
7. **Career Goals** - What's their dream job or aspiration?
8. **Provide Recommendations** - Give 3 personalized career matches

FORMATTING RULES - IMPORTANT:
- Write in clean, natural text - NO markdown symbols like ** or ##
- Use emojis naturally in sentences: "Habari yako, John! 👋"
- Use numbered options with emojis: "1️⃣ Junior Secondary (Grades 7-9)"
- Use line breaks for structure, not markdown formatting
- Write "Next question:" instead of "**Next question:**"
- Write "Habari yako, [Name]!" instead of "**Habari yako, [Name]!**"
- Keep responses clean and readable without any ** or ## symbols

CBE PATHWAYS TO REFERENCE:
**Junior Secondary (7-9):** Broad exploration across all learning areas
**Senior Secondary (10-12):** Choose pathway:
- 🔬 **STEM**: Math, Sciences, Computer Science
- 📚 **Social Sciences**: History, Geography, Economics
- 🎨 **Creative Arts**: Visual Arts, Music, Film
- 🔧 **Technical**: Engineering, Agriculture, Home Science
- 🗣️ **Languages**: English, Kiswahili, Literature

KENYAN CAREER CONTEXT:
- Reference Vision 2030 priorities
- Mention specific universities (UoN, KU, JKUAT, etc.)
- Include salary ranges in KES
- Consider both university and technical college paths
- Focus on emerging opportunities in Kenya

PERSONALITY:
- Friendly and encouraging ("Karibu!", "Fantastic choice!", "That's exciting!")
- Curious and genuinely interested in their responses
- Supportive but realistic about requirements
- Use Kenyan context and cultural understanding

CRITICAL RULE: Ask only ONE question per response. Wait for their answer before moving to the next topic. Be conversational, not robotic.

Remember: YOU MUST ALWAYS BE CURIOUS TO KNOW THEM. Make each question feel personal and engaging!`
  }

  async sendMessage(
    message: string, 
    conversationHistory: ChatMessage[], 
    userContext: UserContext
  ): Promise<string> {
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
        temperature: 0.7
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CareerPath AI - Kenya CBE Career Guidance'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9
        })
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`AI service error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI service')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateCareerRecommendations(userContext: UserContext): Promise<any[]> {
    try {
      // Enhanced prompt with academic performance data
      const academicInfo = userContext.academicPerformance ? `
Academic Performance:
- Overall Average: ${userContext.academicPerformance.overallAverage.toFixed(1)}%
- Strong Subjects: ${userContext.academicPerformance.strongSubjects.join(', ') || 'None identified'}
- Weak Subjects: ${userContext.academicPerformance.weakSubjects.join(', ') || 'None identified'}
- Performance Trend: ${userContext.academicPerformance.performanceTrend}
` : ''

      const prompt = `Generate 3 career recommendations for a Kenyan student based on their profile and academic performance. Return ONLY a JSON array:

Profile: ${userContext.schoolLevel || 'Secondary'} student, Grade ${userContext.currentGrade || '10'}, Subjects: ${userContext.subjects?.slice(0, 3).join(', ') || 'Math, English, Science'}, Interests: ${userContext.interests?.slice(0, 2).join(', ') || 'Technology, Business'}
${academicInfo}
Consider their academic strengths and weaknesses when recommending careers. Focus on careers that align with their strong subjects and provide growth opportunities.

Return exactly this format:
[{"title":"Software Engineer","matchPercentage":85,"description":"Develops software applications","salaryRange":"KSh 80,000-200,000","education":"Computer Science degree","whyRecommended":"Matches your strong performance in Mathematics and interest in technology"},{"title":"Data Analyst","matchPercentage":78,"description":"Analyzes data to help businesses make decisions","salaryRange":"KSh 60,000-150,000","education":"Statistics or Mathematics degree","whyRecommended":"Leverages your analytical skills and strong subject performance"},{"title":"Business Manager","matchPercentage":72,"description":"Manages business operations and teams","salaryRange":"KSh 70,000-180,000","education":"Business Administration degree","whyRecommended":"Combines your interests with leadership opportunities"}]`

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

  async saveConversation(userId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          messages: messages,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to save conversation:', error)
      }
    } catch (error) {
      console.error('Failed to save conversation:', error)
    }
  }

  async loadConversationHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return []
      }

      return data.messages || []
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      return []
    }
  }

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CareerPath AI Connection Test'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
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
