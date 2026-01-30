import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";

import { useActiveSession } from "@/src/session";
import { useRequireSession } from "@/src/session/useRequireSession";
import { SectionCard, GlassButton, GlassScreen } from "@/src/components";

import {
  getProposalFromSession,
  listProposalsFromSession,
  type Proposal,
} from "@/src/storage/proposalsSessionRepo";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ color: "white", fontSize: 14, fontWeight: "900", opacity: 0.92 }}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((t, i) => (
        <Text key={i} style={{ color: "rgba(255,255,255,0.75)" }}>
          • {t}
        </Text>
      ))}
    </View>
  );
}

export default function ProposalDetail() {
  useRequireSession();
  const { session, setAnswer } = useActiveSession();
  const { id } = useLocalSearchParams<{ id: string }>();

  const proposal = useMemo(
    () => (id ? getProposalFromSession(session as any, String(id)) : null),
    [session, id]
  );

  const snapshot = (proposal as Proposal | null)?.snapshot ?? null;
  const ideas = (snapshot?.results?.ideas?.parsed?.ideas ?? []) as any[];

  const brand = snapshot?.answers?.project?.brand ?? "";
  const projectType = snapshot?.answers?.project?.project_type ?? "";

  const updateStatus = async (status: Proposal["status"]) => {
    if (!session || !proposal) return;
    const list = listProposalsFromSession(session as any);
    const next = list.map((p) =>
      p.id === proposal.id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    await setAnswer("answers.proposals.items", next);
  };

  if (!proposal) {
    return (
      <GlassScreen>
        <Stack.Screen options={{ title: "Proposal" }} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
          <SectionCard title="">
            <View style={{ gap: 10 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>No encontrada</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)" }}>No existe una propuesta con id: {String(id)}</Text>
              <GlassButton label="Volver" onPress={() => router.back()} />
            </View>
          </SectionCard>
        </ScrollView>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <Stack.Screen options={{ title: proposal.title }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: "white", fontSize: 30, fontWeight: "900" }}>{proposal.title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.70)" }}>
            {proposal.client} • {proposal.status} • {new Date(proposal.updatedAt).toLocaleString()}
          </Text>
        </View>

        <SectionCard title="">
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <GlassButton label="Volver a lista" onPress={() => router.push("/proposals")} />
              <GlassButton label="Draft" onPress={() => updateStatus("draft")} />
              <GlassButton label="Sent" onPress={() => updateStatus("sent")} />
              <GlassButton label="Approved" onPress={() => updateStatus("approved")} />
              <GlassButton label="Rejected" onPress={() => updateStatus("rejected")} />
            </View>

            <Panel title="Resumen de snapshot">
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                Marca: <Text style={{ color: "white", fontWeight: "900" }}>{brand || "—"}</Text>
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                Tipo: <Text style={{ color: "white", fontWeight: "900" }}>{projectType || "—"}</Text>
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.70)" }}>
                (Este snapshot vive dentro de la propuesta para que no cambie aunque edites el brief.)
              </Text>
            </Panel>

            <Panel title={`Ideas (${ideas.length})`}>
              {ideas.length === 0 ? (
                <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  Esta propuesta no tiene ideas guardadas. Genera ideas en Contexto y crea un borrador nuevo.
                </Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {ideas.map((idea: any) => (
                    <View
                      key={idea.id}
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        padding: 14,
                        gap: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{idea.title}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)" }}>{idea.one_liner}</Text>

                      <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>User flow</Text>
                      <BulletList items={idea.user_flow ?? []} />

                      <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>Key features</Text>
                      <BulletList items={idea.key_features ?? []} />

                      <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>Tech notes</Text>
                      <BulletList items={idea.tech_notes ?? []} />
                    </View>
                  ))}
                </View>
              )}
            </Panel>

            <Panel title="Debug (export snapshot)">
              <GlassButton
                label="Console.log snapshot"
                onPress={() => console.log("PROPOSAL SNAPSHOT:", JSON.stringify(snapshot ?? {}, null, 2))}
              />
            </Panel>
          </View>
        </SectionCard>
      </ScrollView>
    </GlassScreen>
  );
}
