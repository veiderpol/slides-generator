export type ProposalStatus = "draft" | "sent" | "approved" | "rejected";

export type Proposal = {
  id: string;
  title: string;
  client: string;
  status: ProposalStatus;
  updatedAt: string; // ISO
  // snapshot of current session payload (optional but super useful)
  snapshot?: any;
};

export function listProposalsFromSession(session: any): Proposal[] {
  const items = (session?.answers?.answers?.proposals?.items ??
    session?.answers?.proposals?.items ?? // fallback depending how your session is shaped
    []) as Proposal[];

  return [...items].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export function getProposalFromSession(session: any, id: string): Proposal | null {
  const list = listProposalsFromSession(session);
  return list.find((p) => p.id === id) ?? null;
}

export function newProposalId() {
  return `p_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
