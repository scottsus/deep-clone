import presets from "@repo/tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";

const config = {
  presets: [presets],
  content: [
    "./components/**/*.tsx",
    "./app/**/*.tsx",
    "../../packages/ui/**/*.tsx",
  ],
} satisfies Config;

export default config;
