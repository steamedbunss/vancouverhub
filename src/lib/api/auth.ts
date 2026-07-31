//declaring backend auth types and shared api client
import type { ApiUser, LoginCredentials, RegisterCredentials, TokenResponse } from '../../types/backend'
import { apiRequest } from './client'

//This function posts login credentials and returns a JWT token
export function login(credentials: LoginCredentials) {
  return apiRequest<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, null)
}//login

//This function registers a new user and returns a JWT token
export function register(credentials: RegisterCredentials) {
  return apiRequest<TokenResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, null)
}//register

//This function fetches the currently authenticated user profile
export function getCurrentUser(token: string) {
  return apiRequest<ApiUser>('/api/users/me', {}, token)
}//getCurrentUser
