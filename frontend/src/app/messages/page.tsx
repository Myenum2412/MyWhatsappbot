import MessageForm from "../components/message-form";
import { getBackendHealth, getMessages } from "@/lib/api";

export default async function MessagesPage() {
  const [messages, health] = await Promise.all([
    getMessages(),
    getBackendHealth(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Next.js + Fastify + PostgreSQL
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs">
          backend: {health}
        </span>
      </header>

      <MessageForm />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Recent messages ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No messages yet. Start Postgres + Fastify, then queue one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((m) => (
              <li key={m.id} className="rounded-lg border p-3">
                <div className="flex justify-between text-sm">
                  <strong>{m.recipient}</strong>
                  <span className="text-zinc-500">{m.status}</span>
                </div>
                <p className="mt-1 text-sm">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
