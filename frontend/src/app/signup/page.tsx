import { SignupForm } from "@/components/signup-form"
import { AuthShell } from "@/components/auth-shell"

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your business workspace in under a minute."
      subtitle="Connect your first number, import a template, and send a test message today."
    >
      <SignupForm />
    </AuthShell>
  )
}
