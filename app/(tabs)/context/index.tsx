import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useActiveSession } from "@/src/session";
import { useRequireSession } from "@/src/session/useRequireSession";

import { SectionCard, GlassInput, GlassButton, GlassScreen } from "@/src/components";
import { generateIdeas } from "@/src/lib/api";
import { router } from "expo-router";
import { createProposalFromCurrentSession } from "@/src/lib/createProposalFromSession";

// ---------- helpers ----------
function getByPath(obj: any, path: string, fallback: any) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return fallback;
    cur = cur[p];
  }
  return cur ?? fallback;
}

function Grid({
  children,
  minColWidth = 520,
  gap = 16,
}: {
  children: React.ReactNode;
  minColWidth?: number;
  gap?: number;
}) {
  const { width } = useWindowDimensions();
  const cols = width >= minColWidth * 2 ? 2 : 1;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: cols === 2 ? "50%" : "100%",
            paddingHorizontal: gap / 2,
            paddingVertical: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

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

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.9)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "white" }} /> : null}
      </View>
      <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

function RadioRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.9)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "white" }} /> : null}
      </View>
      <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

function toggleInArray(current: string[], value: string) {
  return current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
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
// ---------- screen ----------
export default function ContextIndex() {
  useRequireSession();
  const { session, setAnswer } = useActiveSession();
  const [genLoading, setGenLoading] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  const root = (session as any)?.answers ?? {};


  const brand = getByPath(root, "answers.project.brand", "");
  const generalDesc = getByPath(root, "answers.project.general_description", "");
  const projectType = getByPath(root, "answers.project.project_type", ""); // Evento/Interactivo | Contenido | Ambos

  const industrySelected: string[] = getByPath(root, "answers.context.industry", []);
  const industryOther = getByPath(root, "answers.context.industry_other", "");

  const experienceTypeSelected: string[] = getByPath(root, "answers.context.experience_type", []);
  const experienceTypeOther = getByPath(root, "answers.context.experience_type_other", "");

  const uxTypeValue = getByPath(root, "answers.ux.participation_mode.value", "");
  const uxTypeOther = getByPath(root, "answers.ux.participation_mode.other", "");

  const durationValue = getByPath(root, "answers.ux.duration.value", "");
  const durationOther = getByPath(root, "answers.ux.duration.other", "");

  const brandObjectiveSelected: string[] = getByPath(root, "answers.ux.brand_objective", []);
  const brandObjectiveOther = getByPath(root, "answers.ux.brand_objective_other", "");

  const aestheticSelected: string[] = getByPath(root, "answers.ux.aesthetic", []);
  const aestheticOther = getByPath(root, "answers.ux.aesthetic_other", "");

  const tone = getByPath(root, "answers.ux.tone", "");

  const ideasCountValue = getByPath(root, "answers.control.ideas_count.value", "6");
  const ideasCountOther = getByPath(root, "answers.control.ideas_count.other", "");

  const imagesPerIdea = getByPath(root, "answers.control.images_per_idea", null) as null | boolean;

  const customNotes = getByPath(root, "answers.custom_input.notes", "");
  const ideasParsed = getByPath((session as any)?.answers ?? {}, "results.ideas.parsed.ideas", []) as any[];

  const PROJECT_TYPES = useMemo(() => ["Evento / Interactivo", "Contenido", "Ambos"], []);
  const INDUSTRY = useMemo(() => ["Automotriz", "Entretenimiento", "Gobierno"], []);
  const EXPERIENCE_TYPES = useMemo(() => ["Exp. Immersive", "Minijuego", "VR / AR / XR"], []);
  const UX_TYPES = ["Un Jugador", "1 VS 1", "Multiplayer (4 pax)", "Otro"];
  const BRAND_OBJECTIVES = useMemo(() => ["Giveaway físico", "Cupón o descuento", "Redes sociales"], []);
  const AESTHETIC = useMemo(() => ["Futurista", "Infantil", "Lujo / Premium"], []);
  const TONES = useMemo(() => ["Inspirador", "Serio", "Emotivo"], []);
  const DURATIONS = ["30 seg", "60 seg", "2 min", "5 min", "Otro"];
  const IDEAS_COUNTS = ["4", "6", "8", "12", "Otro"];

  const onViewProposal = async () => {
    if (!session) return;

    const p = await createProposalFromCurrentSession(session as any, setAnswer);
    router.push({ pathname: "/proposals/[id]", params: { id: p.id } });
  };

  const onGenerate = async () => {
    if (!session) return;
    setGenLoading(true);
    setGenError(null);

    try {
      const payload = (session as any)?.answers ?? {};
      const res = await generateIdeas(payload);

      // 1) store raw
      await setAnswer("results.ideas.raw", res.ideas_json);

      // 2) parse safely
      let parsed: any = null;
      try {
        parsed = JSON.parse(res.ideas_json);
      } catch (e) {
        throw new Error("OpenAI did not return valid JSON. Check results.ideas.raw.");
      }

      // 3) store parsed
      await setAnswer("results.ideas.parsed", parsed);

    } catch (e: any) {
      setGenError(e?.message ?? String(e));
    } finally {
      setGenLoading(false);
    }
  };
  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: "white", fontSize: 34, fontWeight: "900" }}>Contexto</Text>
          <Text style={{ color: "rgba(255,255,255,0.70)" }}>
            Completa el brief. Todo se guarda automáticamente en la sesión.
          </Text>
        </View>

        {/* ONE ISLAND */}
        <SectionCard title="">
          <View style={{ gap: 16 }}>
            {/* Top strip */}
            <Grid minColWidth={520} gap={16}>
              <Panel title="Marca">
                <GlassInput
                  value={brand}
                  placeholder="Ej. Nike"
                  onChange={(v) => void setAnswer("answers.project.brand", v)}
                />
              </Panel>

              <Panel title="Tipo de evento">
                {PROJECT_TYPES.map((opt) => (
                  <RadioRow
                    key={opt}
                    label={opt}
                    selected={projectType === opt}
                    onSelect={() => void setAnswer("answers.project.project_type", opt)}
                  />
                ))}
              </Panel>
            </Grid>

            {/* Row: decision panels */}
            <Grid minColWidth={520} gap={16}>
              <Panel title="Industria">
                {INDUSTRY.map((opt) => (
                  <CheckboxRow
                    key={opt}
                    label={opt}
                    checked={industrySelected.includes(opt)}
                    onToggle={() => void setAnswer("answers.context.industry", toggleInArray(industrySelected, opt))}
                  />
                ))}
                <GlassInput
                  label="Otro"
                  value={industryOther}
                  placeholder="Especifica si aplica"
                  onChange={(v) => void setAnswer("answers.context.industry_other", v)}
                />
              </Panel>

              <Panel title="Descripción de proyecto (Evento / Interactivo)">
                {EXPERIENCE_TYPES.map((opt) => (
                  <CheckboxRow
                    key={opt}
                    label={opt}
                    checked={experienceTypeSelected.includes(opt)}
                    onToggle={() =>
                      void setAnswer("answers.context.experience_type", toggleInArray(experienceTypeSelected, opt))
                    }
                  />
                ))}
                <GlassInput
                  label="Otro"
                  value={experienceTypeOther}
                  placeholder="Especifica si aplica"
                  onChange={(v) => void setAnswer("answers.context.experience_type_other", v)}
                />
              </Panel>
            </Grid>

            {/* Big text input */}
            <Panel title="Descripción general">
              <GlassInput
                value={generalDesc}
                placeholder="Describe el proyecto en 2–5 líneas"
                multiline
                onChange={(v) => void setAnswer("answers.project.general_description", v)}
              />
            </Panel>

            {/* Row: UX panels */}
            <Grid minColWidth={520} gap={16}>
              <Panel title="Detalles de UX">
                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>Tipo de UX</Text>
                {UX_TYPES.map((opt) => (
                  <RadioRow
                    key={opt}
                    label={opt}
                    selected={uxTypeValue === opt}
                    onSelect={() => {
                      void setAnswer("answers.ux.participation_mode", {
                        value: opt,
                        other: opt === "Otro" ? uxTypeOther : "",
                      });
                    }}
                  />
                ))}

                {uxTypeValue === "Otro" ? (
                  <GlassInput
                    label="Especifica"
                    value={uxTypeOther}
                    placeholder="Describe el tipo de UX"
                    onChange={(v) => void setAnswer("answers.ux.participation_mode.other", v)}
                  />
                ) : null}

                <View style={{ height: 8 }} />

                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>Duración</Text>
                {DURATIONS.map((opt) => (
                  <RadioRow
                    key={opt}
                    label={opt}
                    selected={durationValue === opt}
                    onSelect={() => {
                      void setAnswer("answers.ux.duration", {
                        value: opt,
                        other: opt === "Otro" ? durationOther: ""
                      });
                    }}
                  />
                ))}

                {durationValue === "Otro" ? (
                  <GlassInput
                    label="Especifica"
                    value={durationOther}
                    placeholder="Ej. 3 min"
                    onChange={(v) => void setAnswer("answers.ux.duration.other", v)}
                  />
                ) : null}
              </Panel>

              <Panel title="Objetivo + Estética">
                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>Objetivo de la marca</Text>
                {BRAND_OBJECTIVES.map((opt) => (
                  <CheckboxRow
                    key={opt}
                    label={opt}
                    checked={brandObjectiveSelected.includes(opt)}
                    onToggle={() =>
                      void setAnswer("answers.ux.brand_objective", toggleInArray(brandObjectiveSelected, opt))
                    }
                  />
                ))}
                <GlassInput
                  label="Otro"
                  value={brandObjectiveOther}
                  placeholder="Especifica si aplica"
                  onChange={(v) => void setAnswer("answers.ux.brand_objective_other", v)}
                />

                <View style={{ height: 8 }} />

                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>Estética de propuesta</Text>
                {AESTHETIC.map((opt) => (
                  <CheckboxRow
                    key={opt}
                    label={opt}
                    checked={aestheticSelected.includes(opt)}
                    onToggle={() =>
                      void setAnswer("answers.ux.aesthetic", toggleInArray(aestheticSelected, opt))
                    }
                  />
                ))}
                <GlassInput
                  label="Otro"
                  value={aestheticOther}
                  placeholder="Especifica si aplica"
                  onChange={(v) => void setAnswer("answers.ux.aesthetic_other", v)}
                />
              </Panel>
            </Grid>

            {/* Proposal / control */}
            <Grid minColWidth={520} gap={16}>
              <Panel title="Detalles de propuesta">
                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>
                  ¿Cuántas ideas necesitas?
                </Text>

                <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                  {IDEAS_COUNTS.map((opt) => (
                    <RadioRow
                      key={opt}
                      label={opt}
                      selected={ideasCountValue === opt}
                      onSelect={() => {
                        void setAnswer("answers.control.ideas_count", {
                          value: opt,
                          other: opt === "Otro" ? ideasCountOther : "",
                        });
                      }}
                    />
                  ))}
                </View>

                {ideasCountValue === "Otro" ? (
                  <GlassInput
                    label="Especifica cuántas"
                    value={ideasCountOther}
                    placeholder="Ej. 15"
                    onChange={(v) =>
                      void setAnswer("answers.control.ideas_count", { value: "Otro", other: v })
                    }
                  />
                ) : null}

                <View style={{ height: 8 }} />
                
                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>
                  ¿Necesitas imagen para cada idea?
                </Text>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <RadioRow
                    label="Sí"
                    selected={imagesPerIdea === true}
                    onSelect={() => void setAnswer("answers.control.images_per_idea", true)}
                  />
                  <RadioRow
                    label="No"
                    selected={imagesPerIdea === false}
                    onSelect={() => void setAnswer("answers.control.images_per_idea", false)}
                  />
                </View>

                <View style={{ height: 8 }} />

                <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>
                  ¿Qué tono debe tener la propuesta?
                </Text>
                {TONES.map((opt) => (
                  <RadioRow
                    key={opt}
                    label={opt}
                    selected={tone === opt}
                    onSelect={() => void setAnswer("answers.ux.tone", opt)}
                  />
                ))}
              </Panel>

              <Panel title="Input personalizado (cliente)">
                <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  Si hay requisitos especiales, escríbelos aquí.
                </Text>
                <GlassInput
                  value={customNotes}
                  placeholder="Ej. Debe funcionar offline, incluir QR, tono premium..."
                  multiline
                  onChange={(v) => void setAnswer("answers.custom_input.notes", v)}
                />
              </Panel>
            </Grid>
            <Panel title="Ideas generadas">
              {genError ? (
                <Text style={{ color: "rgba(255,120,120,0.95)" }}>{genError}</Text>
              ) : null}
              {ideasParsed.map((idea) => (
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
                  {/* Header */}
                  <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>
                    {idea.title}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                    {idea.one_liner}
                  </Text>

                  {/* User flow */}
                  <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>
                    User flow
                  </Text>
                  <BulletList items={idea.user_flow} />

                  {/* Key features */}
                  <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>
                    Key features
                  </Text>
                  <BulletList items={idea.key_features} />

                  {/* Tech notes */}
                  <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>
                    Tech notes
                  </Text>
                  <BulletList items={idea.tech_notes} />

                  {/* Visuals prompt */}
                  <Text style={{ color: "white", fontWeight: "800", marginTop: 6 }}>
                    Visuals prompt
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                    {idea.visuals_prompt}
                  </Text>
                </View>
              ))}
            </Panel>
            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
              <GlassButton
                label="Exportar JSON"
                onPress={() => {
                  console.log("SESSION JSON:", JSON.stringify((session as any)?.answers ?? {}, null, 2));
                }}
              />
              <GlassButton
                label={genLoading ? "Generando…" : "Generar ideas"}
                onPress={onGenerate}
                disabled={genLoading}
              />
              <GlassButton 
                label="Ver propuestas" 
                onPress={onViewProposal} 
              />

            </View>
            
          </View>
        </SectionCard>
      </ScrollView>
    </GlassScreen>
  );
}
