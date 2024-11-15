import presets from "@repo/tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";

const config = {
  presets: [presets],
  content: ["./src/**/*.tsx"],
} satisfies Config;

export default config;
