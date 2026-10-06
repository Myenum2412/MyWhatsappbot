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
import { GalleryVerticalEndIcon } from "lucide-react"
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
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">mywhatsappmsg</span>
            </div>
            <h1 className="text-xl font-bold">Reset your password</h1>
            <FieldDescription>
              Enter your account email and we&apos;ll send you a reset link.
            </FieldDescription>
          </div>
          {sent ? (
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-1 text-zinc-500">
                If an account exists for {email}, a reset link was sent. It
                expires in 1 hour.
              </p>
              {devUrl && (
                <p className="mt-2 break-all">
                  Dev reset link:{" "}
                  <Link className="underline" href={devUrl}>
                    {devUrl}
                  </Link>
                </p>
              )}
              <p className="mt-3">
                <Link className="underline" href="/login">
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
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Remembered it? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </>
          )}
        </FieldGroup>
      </form>
    </div>
  )
}
