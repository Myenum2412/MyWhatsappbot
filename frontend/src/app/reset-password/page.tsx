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
import { GalleryVerticalEndIcon } from "lucide-react"
import Link from "next/link"
import { resetPassword } from "@/lib/auth"

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
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">mywhatsappmsg</span>
            </div>
            <h1 className="text-xl font-bold">Set a new password</h1>
          </div>
          {!token ? (
            <div className="rounded-lg border p-4 text-sm">
              <p>
                This reset link is missing its token. Request a new one from
                the{" "}
                <Link className="underline" href="/forgot-password">
                  forgot password
                </Link>{" "}
                page.
              </p>
            </div>
          ) : done ? (
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">Password updated</p>
              <p className="mt-1 text-zinc-500">
                You can now sign in with your new password.
              </p>
              <p className="mt-3">
                <Link className="underline" href="/login">
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
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        <Link href="/login">Back to login</Link>
      </FieldDescription>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-sm">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
