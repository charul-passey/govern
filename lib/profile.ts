import { z } from "zod";

// The company profile the route accepts, matching the COMPANY PROFILE fields in
// prompts/policy-skill.md.
export const profileSchema = z.object({
  company_name: z.string(),
  headcount_band: z.enum(["1-25", "26-100", "101-500", "501-2000", "2000+"]),
  sector: z.enum([
    "software",
    "ai_native",
    "manufacturing",
    "retail",
    "services",
    "healthcare",
  ]),
  ai_maturity: z.enum(["experimenting", "scaling", "dependent"]),
  strictness: z.enum(["loose", "normal", "strict"]),
});

export type CompanyProfile = z.infer<typeof profileSchema>;
