import api from './api';

export interface AISourceItem {
  title: string;
  module: string;
}

export interface AIChatMessage {
  id?: number;
  sender: 'user' | 'assistant';
  content: string;
  sources?: AISourceItem[];
  suggested_follow_ups?: string[];
  created_at?: string;
}

export interface AIChatResponse {
  conversation_id: number;
  message: string;
  sources: AISourceItem[];
  suggested_follow_ups: string[];
  timestamp: string;
}

export interface AIActionResponse {
  explanation?: string;
  analysis?: string;
  hint?: string;
  sources: AISourceItem[];
  suggested_follow_ups: string[];
}

export interface AIConversationSummary {
  id: number;
  title: string;
  context_type: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface AIConversationDetail {
  id: number;
  title: string;
  context_type: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: number;
    sender: 'user' | 'assistant';
    content: string;
    code_snippet?: string;
    suggested_actions: string[];
    created_at: string;
  }>;
}

export const aiService = {
  /**
   * Send a chat prompt to the AI Quantum Tutor with optional conversation history and learning context.
   */
  async sendMessage(
    message: string,
    conversationId?: number,
    context?: Record<string, any>
  ): Promise<AIChatResponse> {
    const response = await api.post<AIChatResponse>('/ai/chat', {
      message,
      conversation_id: conversationId,
      context,
    });
    return response.data;
  },

  /**
   * Explain a specific quantum computing concept.
   */
  async explainConcept(concept: string, userLevel: string = 'Beginner'): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/explain-concept', {
      concept,
      user_level: userLevel,
    });
    return response.data;
  },

  /**
   * Explain an interactive quantum circuit.
   */
  async explainCircuit(
    circuit: Record<string, any>,
    simulationResults?: Record<string, any>,
    userLevel: string = 'Beginner'
  ): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/explain-circuit', {
      circuit,
      simulation_results: simulationResults,
      user_level: userLevel,
    });
    return response.data;
  },

  /**
   * Explain quantum simulation outcomes and statistical finite-shot distributions.
   */
  async explainResult(
    circuit?: Record<string, any>,
    simulationResults?: Record<string, any>,
    userLevel: string = 'Beginner'
  ): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/explain-result', {
      circuit,
      simulation_results: simulationResults,
      user_level: userLevel,
    });
    return response.data;
  },

  /**
   * Explain Qiskit Python code.
   */
  async explainCode(code: string, userLevel: string = 'Beginner'): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/explain-code', {
      code,
      user_level: userLevel,
    });
    return response.data;
  },

  /**
   * Debug Qiskit code.
   */
  async debugCode(
    code: string,
    errorMessage?: string,
    userLevel: string = 'Beginner'
  ): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/debug-code', {
      code,
      error_message: errorMessage,
      user_level: userLevel,
    });
    return response.data;
  },

  /**
   * Request a progressive Socratic hint without spoiling the full solution.
   */
  async getHint(
    question: string,
    context?: Record<string, any>,
    hintLevel: number = 1
  ): Promise<AIActionResponse> {
    const response = await api.post<AIActionResponse>('/ai/hint', {
      question,
      context,
      hint_level: hintLevel,
    });
    return response.data;
  },

  /**
   * List saved conversations for current user.
   */
  async getConversations(): Promise<AIConversationSummary[]> {
    const response = await api.get<AIConversationSummary[]>('/ai/conversations');
    return response.data;
  },

  /**
   * Fetch full message history for a conversation.
   */
  async getConversationDetail(conversationId: number): Promise<AIConversationDetail> {
    const response = await api.get<AIConversationDetail>(`/ai/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Delete a saved conversation.
   */
  async deleteConversation(conversationId: number): Promise<{ message: string; id: number }> {
    const response = await api.delete<{ message: string; id: number }>(`/ai/conversations/${conversationId}`);
    return response.data;
  },
};

export default aiService;
