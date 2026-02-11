import { supabase } from '../lib/supabase';

export class ChatbotAI {
  constructor() {
    this.qaCache = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadQAData() {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select(`
          *,
          category:chatbot_categories(name_ar, icon)
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (!error && data) {
        this.qaCache = data;
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error loading QA data:', error);
      return [];
    }
  }

  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FF\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  calculateSimilarity(str1, str2) {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 80;

    const words1 = s1.split(' ');
    const words2 = s2.split(' ');

    let matchCount = 0;
    words1.forEach(word => {
      if (words2.includes(word)) matchCount++;
    });

    return Math.round((matchCount / Math.max(words1.length, words2.length)) * 100);
  }

  searchKeywords(userMessage, keywords) {
    if (!keywords || keywords.length === 0) return 0;

    const normalizedMessage = this.normalizeText(userMessage);
    let matchCount = 0;
    let totalWeight = 0;

    keywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedMessage.includes(normalizedKeyword)) {
        matchCount++;
        totalWeight += normalizedKeyword.split(' ').length;
      }
    });

    if (matchCount === 0) return 0;

    return Math.min(100, (matchCount / keywords.length) * 100 + totalWeight * 5);
  }

  async findBestMatch(userMessage) {
    if (this.qaCache.length === 0) {
      await this.loadQAData();
    }

    if (this.qaCache.length === 0) {
      return null;
    }

    let bestMatch = null;
    let bestScore = 0;

    this.qaCache.forEach(qa => {
      let score = 0;

      const questionScore = this.calculateSimilarity(userMessage, qa.question_ar);
      score += questionScore * 0.6;

      const keywordScore = this.searchKeywords(userMessage, qa.keywords);
      score += keywordScore * 0.4;

      const priorityBonus = qa.priority || 5;
      score += priorityBonus;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    });

    const threshold = 30;
    if (bestScore > threshold && bestMatch) {
      await this.recordUsage(bestMatch.id, userMessage, bestMatch.answer_ar);
      return {
        answer: bestMatch.answer_ar,
        question: bestMatch.question_ar,
        category: bestMatch.category,
        confidence: Math.min(100, Math.round(bestScore)),
        qaId: bestMatch.id
      };
    }

    return null;
  }

  async recordUsage(qaId, userMessage, botResponse) {
    try {
      await supabase.rpc('increment_qa_usage', { qa_id: qaId });

      await supabase.from('chatbot_conversations').insert({
        session_id: this.sessionId,
        user_message: userMessage,
        bot_response: botResponse,
        matched_qa_id: qaId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  }

  async recordFeedback(conversationId, wasHelpful, userFeedback = null) {
    try {
      const { data: conversation } = await supabase
        .from('chatbot_conversations')
        .select('matched_qa_id')
        .eq('id', conversationId)
        .single();

      if (conversation && conversation.matched_qa_id) {
        const field = wasHelpful ? 'helpful_count' : 'not_helpful_count';
        const { data: currentQA } = await supabase
          .from('chatbot_questions_answers')
          .select(field)
          .eq('id', conversation.matched_qa_id)
          .single();

        if (currentQA) {
          await supabase
            .from('chatbot_questions_answers')
            .update({ [field]: (currentQA[field] || 0) + 1 })
            .eq('id', conversation.matched_qa_id);
        }
      }

      await supabase
        .from('chatbot_conversations')
        .update({
          was_helpful: wasHelpful,
          user_feedback: userFeedback
        })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }

  getDefaultResponse() {
    return {
      answer: 'شكراً لتواصلك! 👋\n\nلم أتمكن من فهم سؤالك بشكل كامل. يمكنك:\n\n1️⃣ إعادة صياغة سؤالك بطريقة أخرى\n2️⃣ اختيار من الأسئلة الشائعة أدناه\n3️⃣ التواصل مع موظف مختص للحصول على مساعدة مباشرة\n\nكيف يمكنني مساعدتك؟',
      confidence: 0,
      isDefault: true
    };
  }

  async getPopularQuestions(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select('id, question_ar, category:chatbot_categories(name_ar, icon)')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error getting popular questions:', error);
      return [];
    }
  }

  async getQuestionsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select('id, question_ar, answer_ar')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(10);

      if (!error && data) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error getting questions by category:', error);
      return [];
    }
  }
}

export default ChatbotAI;
