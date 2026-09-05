import api from './api';
import { CircuitGridState } from '../types/circuit';

export interface ChallengeSummary {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  points_reward: number;
  is_solved: boolean;
  best_fidelity: number;
  attempt_count: number;
}

export interface ChallengeDetail {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  points_reward: number;
  starter_circuit: CircuitGridState;
  starter_qiskit_code?: string;
  target_state_vector?: string;
  is_solved: boolean;
  best_fidelity: number;
}

export interface ChallengeSubmitResult {
  attempt_id: number;
  challenge_id: number;
  challenge_title: string;
  solved: boolean;
  fidelity_score: number;
  message: string;
  detailed_checks: string[];
  simulation_results?: any;
  awarded_xp: number;
  attempted_at: string;
}

export interface ChallengeAttemptItem {
  id: number;
  challenge_id: number;
  solved: boolean;
  fidelity_score: number;
  attempted_at: string;
}

export interface ChallengeHint {
  challenge_id: number;
  hint_level: number;
  total_hints: number;
  hint: string;
}

export const challengeService = {
  /**
   * Retrieves all quantum challenges with student completion status.
   */
  async getChallenges(): Promise<ChallengeSummary[]> {
    const response = await api.get<ChallengeSummary[]>('/challenges');
    return response.data;
  },

  /**
   * Retrieves details, starter circuit, and specifications for a challenge.
   */
  async getChallengeById(idOrSlug: string | number): Promise<ChallengeDetail> {
    const response = await api.get<ChallengeDetail>(`/challenges/${idOrSlug}`);
    return response.data;
  },

  /**
   * Submits a quantum circuit for automated evaluation and XP award.
   */
  async submitChallenge(challengeId: number | string, circuit: CircuitGridState): Promise<ChallengeSubmitResult> {
    const response = await api.post<ChallengeSubmitResult>(`/challenges/${challengeId}/submit`, {
      circuit,
    });
    return response.data;
  },

  /**
   * Retrieves attempt history for a challenge.
   */
  async getChallengeAttempts(challengeId: number | string): Promise<ChallengeAttemptItem[]> {
    const response = await api.get<ChallengeAttemptItem[]>(`/challenges/${challengeId}/attempts`);
    return response.data;
  },

  /**
   * Retrieves progressive Socratic hint for a challenge.
   */
  async getChallengeHint(challengeId: number | string, hintLevel: number = 1): Promise<ChallengeHint> {
    const response = await api.post<ChallengeHint>(`/challenges/${challengeId}/hint?hint_level=${hintLevel}`);
    return response.data;
  },
};

export default challengeService;
