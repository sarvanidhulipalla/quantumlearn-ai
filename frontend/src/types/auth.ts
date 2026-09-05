export type UserRole = 'Student' | 'Instructor' | 'Admin';

export type EducationLevel =
  | 'High School'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Researcher'
  | 'Industry Professional'
  | 'Self-Taught / Enthusiast';

export type QuantumExperience =
  | 'Beginner (No background)'
  | 'Intermediate (Basic linear algebra & python)'
  | 'Advanced (Experienced with quantum gates & Qiskit)';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  education_level?: EducationLevel;
  quantum_experience?: QuantumExperience;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  enrolled_courses_count?: number;
  completed_lessons_count?: number;
  total_points?: number;
  achievements_count?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  education_level?: EducationLevel;
  quantum_experience?: QuantumExperience;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
