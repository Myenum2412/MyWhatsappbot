"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CircleAlertIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react"
import Link from "next/link"
import { resetPassword } from "@/lib/auth"
import { AuthShell } from "@/components/auth-shell"

function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed")
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
              Set a new password
            </h1>
            <FieldDescription className="text-[13.5px]">
              Choose a strong password with at least 8 characters.
            </FieldDescription>
          </div>
          {!token ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <p className="leading-relaxed text-muted-foreground">
                This reset link is missing its token. Request a new one from
                the{" "}
                <Link className="font-medium text-foreground underline underline-offset-4" href="/forgot-password">
                  forgot password
                </Link>{" "}
                page.
              </p>
            </div>
          ) : done ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 text-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2Icon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">Password updated</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <p className="mt-4">
                <Link
                  className="inline-flex items-center rounded-xl bg-foreground px-3.5 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
                  href="/login"
                >
                  Go to login
                </Link>
              </p>
            </div>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="password">
                  New password (min 8 chars)
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-10 rounded-xl bg-card focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-10 rounded-xl bg-card focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
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
                  className="h-10 w-full rounded-xl bg-foreground text-background hover:opacity-90"
                >
                  {loading && <Loader2Icon className="animate-spin" />}
                  {loading ? "Updating..." : "Update password"}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>
      <FieldDescription className="text-center text-[13px]">
        <Link href="/login" className="underline underline-offset-4">
          Back to login
        </Link>
      </FieldDescription>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a fresh, secure password."
      subtitle="Your new password takes effect immediately on all sessions."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
