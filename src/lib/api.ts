const DEV_API_BASE =
  // web can use localhost, native needs your LAN IP.
  typeof window !== "undefined"
    ? "http://localhost:3001"
    : "http://YOUR_LAN_IP:3001"; // <-- replace with your machine IP when testing on device

export async function generateIdeas(sessionJson: any) {
  const r = await fetch(`${DEV_API_BASE}/api/generate-ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionJson),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`API ${r.status}: ${text}`);
  }

  return r.json() as Promise<{ ok: boolean; ideas_json: string }>;
}
