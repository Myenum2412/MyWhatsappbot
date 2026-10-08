import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { AuthShell } from "@/components/auth-shell"

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Locked out? Let's get you back in."
      subtitle="Reset links expire in one hour and are single-use for your security."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
