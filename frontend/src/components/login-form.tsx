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
import { GalleryVerticalEndIcon } from "lucide-react"
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
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">mywhatsappmsg</span>
            </div>
            <h1 className="text-xl font-bold">Welcome back</h1>
            <FieldDescription>
              Common login for orgmenu and business owners. Don&apos;t have an
              account? <Link href="/signup">Sign up</Link>
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
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-sm underline underline-offset-4"
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
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            <span className="block rounded-lg border p-3 text-left">
              <span className="font-medium">Demo login</span>
              <span className="mt-1 block">
                Email: <span className="font-mono">orgmenu@example.com</span>
              </span>
              <span className="block">
                Password: <span className="font-mono">ChangeMe123!</span>
              </span>
              <button
                type="button"
                className="mt-2 underline underline-offset-4"
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
