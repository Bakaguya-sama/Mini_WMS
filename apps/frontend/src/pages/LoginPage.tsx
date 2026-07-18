import { LoginForm } from '@/features/auth/components/LoginForm'

/**
 * Login page — full-screen layout with the LoginForm.
 * This page is publicly accessible (no auth required).
 */
export function LoginPage() {
  return <LoginForm />
}
