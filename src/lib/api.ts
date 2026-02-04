function getApiBase() {
  // Cloudflare Pages (or any deployed web) → same origin
  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    // If you're on localhost, use your local Express server
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3001";
    }

    // Otherwise (Pages custom domain, pages.dev, etc.), use same origin
    return "";
  }

  // React Native / non-browser environment:
  // Use your LAN IP for local testing on device (keep as env var ideally)
  return "http://YOUR_LAN_IP:3001";
}
export async function generateIdeas(sessionJson: any) {
  const apiBase = getApiBase();
  const r = await fetch(`${apiBase}/api/generate-ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionJson),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`API ${r.status}: ${text}`);
  }

  return r.json() as Promise<{ ok: boolean; ideas_json: string; ideas?: any }>;
}
