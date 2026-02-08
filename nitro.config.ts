import { defineNitroConfig } from 'nitro/config';

// Keep presets selectable via env so we can build for different providers in CI.
// Examples:
// - Vercel:       VERCEL=1 bun run build
// - CF Workers:   NITRO_PRESET=cloudflare-module bun run build
// - CF Pages:     NITRO_PRESET=cloudflare-pages bun run build
const preset =
  process.env.NITRO_PRESET ||
  // Keep Vercel behavior when VERCEL=1 is present.
  // Otherwise default to Cloudflare Workers for deploy builds.
  (process.env.VERCEL ? 'vercel' : 'cloudflare-module');

export default defineNitroConfig({
  preset,
});
