export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface MessageResponse {
  message: string;
}

export interface EmailVerificationState {
  isVerifying: boolean;
  isResending: boolean;
  message: string | null;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  emailVerificationState: EmailVerificationState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}