// functions/api/generate-ideas.js

const schemaFor = (n) => ({
    type: "object",
    additionalProperties: false,
    required: ["ideas"],
    properties: {
        ideas: {
            type: "array",
            minItems: n,
            maxItems: n,
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "id",
                    "title",
                    "one_liner",
                    "user_flow",
                    "key_features",
                    "tech_notes",
                    "visuals_prompt",
                ],
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    one_liner: { type: "string" },
                    user_flow: { type: "array", items: { type: "string" } },
                    key_features: { type: "array", items: { type: "string" } },
                    tech_notes: { type: "array", items: { type: "string" } },
                    visuals_prompt: { type: "string" },
                },
            },
        },
    },
});

function json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...extraHeaders,
        },
    });
}

// Pages Function entrypoint
export async function onRequest(context) {
    const { request, env } = context;

    // (Optional) If you ever call from a different domain, keep CORS.
    // If your frontend calls same-domain (/api/...), you can remove this.
    const origin = request.headers.get("Origin") || "*";
    const corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405, corsHeaders);
    }

    try {
        const sessionJson = await request.json();
        const answers = sessionJson?.answers ?? {};

        const countRaw = answers?.control?.ideas_count;
        const ideasCount =
            typeof countRaw === "number"
                ? countRaw
                : parseInt(
                countRaw?.value === "Otro"
                    ? (countRaw?.other ?? "6")
                    : (countRaw?.value ?? "6"),
                10
            ) || 6;

        const imagesPerIdea = !!answers?.control?.images_per_idea;

        if (!env.OPENAI_API_KEY) {
            return json(
                { ok: false, error: "Missing OPENAI_API_KEY env var" },
                500,
                corsHeaders
            );
        }

        // Call OpenAI Responses API directly (Worker/Pages compatible)
        const r = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-5",
                input: [
                    {
                        role: "system",
                        content:
                            "You generate creative proposal ideas in Spanish. Output must be valid JSON matching the schema.",
                    },
                    {
                        role: "user",
                        content: JSON.stringify(
                            {
                                brief: answers,
                                request: { ideas_count: ideasCount, images_per_idea: imagesPerIdea },
                            },
                            null,
                            2
                        ),
                    },
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: "ideas_schema",
                        strict: true,
                        schema: schemaFor(ideasCount),
                    },
                },
            }),
        });

        if (!r.ok) {
            const details = await r.text();
            return json(
                { ok: false, error: "OpenAI error", details },
                500,
                corsHeaders
            );
        }

        const response = await r.json();
        const raw = response?.output_text;
        if (!raw) throw new Error("No output_text returned from OpenAI.");

        const parsed = JSON.parse(raw);

        return json(
            { ok: true, ideas_json: raw, ideas: parsed },
            200,
            corsHeaders
        );
    } catch (err) {
        return json(
            { ok: false, error: String(err?.message ?? err) },
            500,
            corsHeaders
        );
    }
}
