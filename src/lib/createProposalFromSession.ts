import { newProposalId, listProposalsFromSession, type Proposal } from "@/src/storage/proposalsSessionRepo";

export async function createProposalFromCurrentSession(session: any, setAnswer: any) {
  const snapshot = session?.answers ?? {};

  const brand = snapshot?.answers?.project?.brand ?? "Sin marca";
  const title = `${brand} — Propuesta`;

  const proposal: Proposal = {
    id: newProposalId(),
    title,
    client: brand,
    status: "draft",
    updatedAt: new Date().toISOString(),
    snapshot,
  };

  const existing = listProposalsFromSession(session);
  await setAnswer("answers.proposals.items", [proposal, ...existing]);

  return proposal;
}
