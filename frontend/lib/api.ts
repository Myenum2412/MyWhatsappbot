export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(data: { name: string; email: string }) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create user");
  return json;
}

// Campaigns
export async function getCampaigns() {
  const res = await fetch(`${API_URL}/api/campaigns`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function getCampaignStats() {
  const res = await fetch(`${API_URL}/api/campaigns/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function createCampaign(data: any) {
  const res = await fetch(`${API_URL}/api/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create campaign");
  return json;
}

export async function deleteCampaign(id: string) {
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete");
  return json;
}

export async function duplicateCampaign(id: string) {
  const res = await fetch(`${API_URL}/api/campaigns/${id}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to duplicate");
  return json;
}

// WhatsApp (wwebjs.dev)
export async function getWhatsappQR() {
  const res = await fetch(`${API_URL}/api/whatsapp/qr`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch QR");
  return res.json();
}
export async function refreshWhatsappQR() {
  const res = await fetch(`${API_URL}/api/whatsapp/qr/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to refresh QR");
  return res.json();
}
export async function getWhatsappStatus() {
  const res = await fetch(`${API_URL}/api/whatsapp/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}
export async function sendWhatsappMessage(to: string, message: string) {
  const res = await fetch(`${API_URL}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, message }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send");
  return json;
}
