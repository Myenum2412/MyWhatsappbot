"use client"

import { useState } from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CircleAlertIcon, Loader2Icon, MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { forgotPassword } from "@/lib/auth"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [devUrl, setDevUrl] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await forgotPassword(email.trim())
      setSent(true)
      setDevUrl(data.resetUrl ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
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
              Reset your password
            </h1>
            <FieldDescription className="text-[13.5px]">
              Enter your account email and we&apos;ll send you a reset link.
            </FieldDescription>
          </div>
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <MailCheckIcon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">Check your inbox</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                If an account exists for {email}, a reset link was sent. It
                expires in 1 hour.
              </p>
              {devUrl && (
                <p className="mt-2 text-[13px] break-all">
                  Dev reset link:{" "}
                  <Link className="underline underline-offset-4" href={devUrl}>
                    {devUrl}
                  </Link>
                </p>
              )}
              <p className="mt-4">
                <Link
                  className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
                  href="/login"
                >
                  Back to login
                </Link>
              </p>
            </div>
          ) : (
            <>
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
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </Field>
              <FieldDescription className="text-center text-[13px]">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Sign in
                </Link>
              </FieldDescription>
            </>
          )}
        </FieldGroup>
      </form>
    </div>
  )
}
