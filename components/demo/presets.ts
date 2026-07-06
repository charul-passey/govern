import type { CompanyProfile } from "@/lib/profile";

// Type-only imports keep Zod and the SDK out of the client bundle.
export type Headcount = CompanyProfile["headcount_band"];
export type Sector = CompanyProfile["sector"];
export type Maturity = CompanyProfile["ai_maturity"];
export type Strictness = CompanyProfile["strictness"];

export interface Preset {
  id: string;
  name: string;
  detail: string;
  profile: Omit<CompanyProfile, "strictness">;
}

export const PRESETS: Preset[] = [
  {
    id: "seed",
    name: "Seed startup",
    detail: "15 people, AI-native",
    profile: { company_name: "Seed startup", headcount_band: "1-25", sector: "ai_native", ai_maturity: "scaling" },
  },
  {
    id: "series-c",
    name: "Series C SaaS",
    detail: "300 people, scaling AI",
    profile: { company_name: "Series C SaaS", headcount_band: "101-500", sector: "software", ai_maturity: "scaling" },
  },
  {
    id: "industrial",
    name: "Industrial manufacturer",
    detail: "2,000 people, early AI",
    profile: { company_name: "Industrial manufacturer", headcount_band: "501-2000", sector: "manufacturing", ai_maturity: "experimenting" },
  },
];

export const HEADCOUNTS: { value: Headcount; label: string }[] = [
  { value: "1-25", label: "1-25" },
  { value: "26-100", label: "26-100" },
  { value: "101-500", label: "101-500" },
  { value: "501-2000", label: "501-2000" },
  { value: "2000+", label: "2000+" },
];

export const SECTORS: { value: Sector; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "ai_native", label: "AI-native" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "services", label: "Services" },
  { value: "healthcare", label: "Healthcare" },
];

export const MATURITIES: { value: Maturity; label: string }[] = [
  { value: "experimenting", label: "Experimenting" },
  { value: "scaling", label: "Scaling" },
  { value: "dependent", label: "Dependent" },
];

export const STRICTNESSES: { value: Strictness; label: string }[] = [
  { value: "loose", label: "Loose" },
  { value: "normal", label: "Normal" },
  { value: "strict", label: "Strict" },
];
