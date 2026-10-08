import { LoginForm } from "@/components/login-form"
import { AuthShell } from "@/components/auth-shell"

export default function LoginPage() {
  return (
    <AuthShell
      title="Ship WhatsApp messaging your customers actually read."
      subtitle="One workspace for numbers, templates, campaigns and automation — with delivery you can trust."
    >
      <LoginForm />
    </AuthShell>
  )
}
