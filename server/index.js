const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        required: ["id", "title", "one_liner", "user_flow", "key_features", "tech_notes", "visuals_prompt"],
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

app.post("/api/generate-ideas", async (req, res) => {
  try {
    const sessionJson = req.body;
    const answers = sessionJson?.answers ?? {};

    const countRaw = answers?.control?.ideas_count;
    const ideasCount =
      typeof countRaw === "number"
        ? countRaw
        : parseInt(
            countRaw?.value === "Otro" ? (countRaw?.other ?? "6") : (countRaw?.value ?? "6"),
            10
          ) || 6;

    const imagesPerIdea = !!answers?.control?.images_per_idea;

    const response = await client.responses.create({
    model: "gpt-5",
    input: [
        {
        role: "system",
        content: "You generate creative proposal ideas in Spanish. Output must be valid JSON matching the schema.",
        },
        {
        role: "user",
        content: JSON.stringify(
            {
            brief: answers,
            request: {
                ideas_count: ideasCount,
                images_per_idea: imagesPerIdea,
            },
            },
            null,
            2
        ),
        },
    ],
    text: {
        format: {
        type: "json_schema",
        strict: true,
        schema: schemaFor(ideasCount),
        },
    },
    });

    const raw = response.output_text;
    if (!raw) throw new Error("No output_text returned from OpenAI.");

    const parsed = JSON.parse(raw);

    res.json({
      ok: true,
      ideas_json: raw,
      ideas: parsed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
