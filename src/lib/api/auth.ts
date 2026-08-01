//declaring backend auth types and shared api client
import type {
  ApiUser,
  LoginCredentials,
  MessageResponse,
  RegisterCredentials,
  TokenResponse,
} from '../../types/backend'
import { apiRequest } from './client'

//This function posts login credentials and returns a JWT token
export function login(credentials: LoginCredentials) {
  return apiRequest<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, null)
}//login

//This function registers a new user and returns a confirmation message
export function register(credentials: RegisterCredentials) {
  return apiRequest<MessageResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, null)
}//register

//This function confirms a user's email and returns a JWT token
export function confirmEmail(token: string) {
  return apiRequest<TokenResponse>('/api/auth/confirm-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }, null)
}//confirmEmail

//This function requests a fresh email confirmation link
export function resendConfirmation(email: string) {
  return apiRequest<MessageResponse>('/api/auth/resend-confirmation', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, null)
}//resendConfirmation

//This function requests a password reset email
export function forgotPassword(email: string) {
  return apiRequest<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, null)
}//forgotPassword

//This function resets a password using a token from the reset email
export function resetPassword(input: { token: string; password: string }) {
  return apiRequest<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  }, null)
}//resetPassword

//This function fetches the currently authenticated user profile
export function getCurrentUser(token: string) {
  return apiRequest<ApiUser>('/api/users/me', {}, token)
}//getCurrentUser
