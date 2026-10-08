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
import { destinationForRole, login, saveSession } from "@/lib/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Common login: backend returns the user's role, we redirect by role
      const { user, token } = await login(email.trim(), password)
      saveSession(user, token)
      router.push(destinationForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
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
              Welcome back
            </h1>
            <FieldDescription className="text-[13.5px]">
              Common login for orgmenu and business owners. Don&apos;t have an
              account?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Sign up
              </Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="orgmenu@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-xl bg-card transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-[13px] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldDescription>
            <span className="block rounded-2xl border border-border bg-muted/40 p-4 text-left">
              <span className="text-[12px] font-semibold tracking-wide uppercase text-muted-foreground">
                Demo login
              </span>
              <span className="mt-2 block text-[13px]">
                Email: <span className="font-mono text-[12.5px]">orgmenu@example.com</span>
              </span>
              <span className="block text-[13px]">
                Password: <span className="font-mono text-[12.5px]">ChangeMe123!</span>
              </span>
              <button
                type="button"
                className="mt-2.5 inline-flex items-center rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] font-medium transition-all duration-150 hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-300"
                onClick={() => {
                  setEmail("orgmenu@example.com")
                  setPassword("ChangeMe123!")
                }}
              >
                Fill demo credentials
              </button>
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}
