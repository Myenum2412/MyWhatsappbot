"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CircleAlertIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import {
  destinationForRole,
  saveSession,
  signup,
} from "@/lib/auth"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // All new signups default to a business account (orgmenu is admin-seeded only)
      const { user, token } = await signup(
        name.trim(),
        email.trim(),
        password,
        "businessowners"
      )
      saveSession(user, token)
      router.push(destinationForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex flex-col gap-2">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
              Create a business account
            </h1>
            <FieldDescription className="text-[13.5px]">
              Start sending WhatsApp messages in minutes. Already have an
              account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Sign in
              </Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="h-10 rounded-xl bg-card transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-xl bg-card transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password (min 8 chars)</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10 rounded-xl bg-card transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-700 dark:text-red-300"
            >
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
          <Field>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-xl bg-foreground text-background shadow-sm transition-all duration-150 hover:opacity-90 active:translate-y-px"
            >
              {loading && <Loader2Icon className="animate-spin" />}
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </Field>
          <FieldDescription className="text-center text-[12.5px]">
            By continuing you agree to opt-in and compliance policies.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}
