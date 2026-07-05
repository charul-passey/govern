/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Bundle the prompt and presets into the serverless function; the route reads
    // them from disk at runtime.
    outputFileTracingIncludes: {
      "/api/generate-policy": ["./prompts/policy-skill.md", "./data/presets/**"],
    },
  },
};

export default nextConfig;
