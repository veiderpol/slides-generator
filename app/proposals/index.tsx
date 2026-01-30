import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { useActiveSession } from "@/src/session";
import { useRequireSession } from "@/src/session/useRequireSession";

import { SectionCard, GlassButton, GlassScreen } from "@/src/components";
import {
  listProposalsFromSession,
  newProposalId,
  type Proposal,
} from "@/src/storage/proposalsSessionRepo";

function Pill({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "800" }}>{text}</Text>
    </View>
  );
}

function CardRow({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.04)",
        padding: 14,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <Text style={{ color: "white", fontWeight: "900", fontSize: 16, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>

      <Text style={{ color: "rgba(255,255,255,0.75)" }} numberOfLines={2}>
        {subtitle}
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        <GlassButton label="Abrir" onPress={onPress} />
      </View>
    </View>
  );
}

export default function ProposalsIndex() {
  useRequireSession();
  const { session, setAnswer } = useActiveSession();

  const proposals = useMemo(() => listProposalsFromSession(session as any), [session]);


  return (
    <GlassScreen>
      <Stack.Screen options={{ title: "Proposals" }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: "white", fontSize: 34, fontWeight: "900" }}>Propuestas</Text>
          <Text style={{ color: "rgba(255,255,255,0.70)" }}>
            Boradores y propuestas generadas dentro de la sesión.
          </Text>
        </View>

        <SectionCard title="">
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <GlassButton label="Volver a Contexto" onPress={() => router.push("/")} />
            </View>

            {proposals.length === 0 ? (
              <View
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  padding: 14,
                  gap: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>Aún no hay propuestas</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  Crea un borrador tomando un snapshot de tus respuestas + ideas generadas.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {proposals.map((p) => (
                  <CardRow
                    key={p.id}
                    title={p.title}
                    subtitle={`${p.client} • ${new Date(p.updatedAt).toLocaleString()} • id: ${p.id}`}
                    right={<Pill text={p.status} />}
                    onPress={() => router.push({ pathname: "/proposals/[id]", params: { id: p.id } })}
                  />
                ))}
              </View>
            )}
          </View>
        </SectionCard>
      </ScrollView>
    </GlassScreen>
  );
}
