export function makeEmptyTemplate() {
  return {
    schema_version: 1,
    ui_state: { current_screen: "context" },
    answers: {
      project: {
        brand: "",
        general_description: "",
        project_type: "",
      },
      context: {
        industry: [],
        industry_other: "",
        experience_type: [],
        experience_type_other: "",
      },
      ux: {
        participation_mode: { value: "", other: "" }, // single choice
        duration: { value: "", other: "" },           // single choice
        brand_objective: [],
        brand_objective_other: "",
        aesthetic: [],
        aesthetic_other: "",
        tone: "",
      },
      control: {
        ideas_count: { value: "6", other: "" },
        images_per_idea: null,
        },
      custom_input: {
        notes: "",
      },
    },
    results: {},
  };
}
