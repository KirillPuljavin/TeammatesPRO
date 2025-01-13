import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // Apply to JavaScript and TypeScript files
    ignores: ["node_modules", ".next", "build"], // Ignore unnecessary directories
    rules: {
      "no-console": "off", // Allow console.log (customize as needed)
      "no-unused-vars": "warn", // Warn on unused variables
      "no-debugger": "warn", // Warn on debugger statements
    },
  },
];

export default eslintConfig;
