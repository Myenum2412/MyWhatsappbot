export interface MessageRow {
  id: number;
  recipient: string;
  body: string;
  status: string;
  created_at: string;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export async function getMessages(): Promise<MessageRow[]> {
  const base = getApiUrl();
  try {
    const res = await fetch(`${base}/api/messages`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages ?? [];
  } catch {
    return [];
  }
}

export async function getBackendHealth(): Promise<string> {
  const base = getApiUrl();
  try {
    const res = await fetch(`${base}/api/health`, { cache: "no-store" });
    if (!res.ok) return "offline";
    const data = await res.json();
    return data.status ?? "unknown";
  } catch {
    return "offline";
  }
}
