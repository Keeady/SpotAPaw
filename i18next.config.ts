import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en", "es"],
  extract: {
    input: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    output: "locales/{{language}}/{{namespace}}.json",
  },
});
