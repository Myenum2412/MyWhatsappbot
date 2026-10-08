import Link from "next/link";
import { MessageCircleIcon, ShieldCheckIcon, ZapIcon, LayersIcon } from "lucide-react";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0c1512] text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 320px at 20% 0%, oklch(0.68 0.16 155 / 0.35), transparent 70%), radial-gradient(500px 400px at 90% 100%, oklch(0.55 0.12 260 / 0.3), transparent 70%), radial-gradient(1px 1px at 20% 30%, white 1px, transparent 1px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <Link href="/login" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
            <MessageCircleIcon className="size-4.5" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            MyWhatsAppMsg
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            WhatsApp Business Platform
          </p>
          <h1 className="text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
            {title}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65">{subtitle}</p>
          <ul className="mt-8 space-y-3">
            {[
              { icon: ZapIcon, text: "Connect numbers in seconds with QR pairing" },
              { icon: LayersIcon, text: "Templates, campaigns and flows in one place" },
              { icon: ShieldCheckIcon, text: "Opt-in compliance and full audit trail" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[13px] text-white/75">
                <span className="flex size-7 items-center justify-center rounded-lg border border-white/12 bg-white/10">
                  <f.icon className="size-3.5" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-white/45">
          Enterprise-grade messaging · SOC2-ready practices · 99.9% delivery focus
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center gap-6 p-6 sm:p-10">
        <Link
          href="/login"
          className="flex items-center gap-2 lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <MessageCircleIcon className="size-4" />
          </span>
          <span className="text-[14px] font-semibold tracking-tight">MyWhatsAppMsg</span>
        </Link>
        <div className="w-full max-w-[380px]">{children}</div>
        <p className="text-[12px] text-muted-foreground">
          Protected by rate-limiting and secure token auth.
        </p>
      </div>
    </div>
  );
}
