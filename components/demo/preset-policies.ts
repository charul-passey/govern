import type { Policy } from "@/lib/policy-schema";
import type { CompanyProfile } from "@/lib/profile";
import type { Strictness } from "@/components/demo/presets";

import seedLoose from "@/data/presets/seed-startup-loose.json";
import seedNormal from "@/data/presets/seed-startup-normal.json";
import seedStrict from "@/data/presets/seed-startup-strict.json";
import seriesLoose from "@/data/presets/series-c-saas-loose.json";
import seriesNormal from "@/data/presets/series-c-saas-normal.json";
import seriesStrict from "@/data/presets/series-c-saas-strict.json";
import industrialLoose from "@/data/presets/industrial-mfg-loose.json";
import industrialNormal from "@/data/presets/industrial-mfg-normal.json";
import industrialStrict from "@/data/presets/industrial-mfg-strict.json";

export interface PresetFile {
  profile: CompanyProfile;
  policy: Policy;
}

const file = (json: unknown) => json as unknown as PresetFile;

// The nine committed presets, served instantly. Strictness switching for a preset
// company swaps between its three files client-side.
export const PRESET_POLICIES: Record<string, Record<Strictness, PresetFile>> = {
  seed: { loose: file(seedLoose), normal: file(seedNormal), strict: file(seedStrict) },
  "series-c": { loose: file(seriesLoose), normal: file(seriesNormal), strict: file(seriesStrict) },
  industrial: {
    loose: file(industrialLoose),
    normal: file(industrialNormal),
    strict: file(industrialStrict),
  },
};
