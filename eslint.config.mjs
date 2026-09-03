import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/",
      "out/",
      "node_modules/",
      "public/",
      "scripts/",
    ],
  },
  {
    // Register react-hooks so the inline
    // "eslint-disable-line react-hooks/exhaustive-deps" directives in the
    // portal resolve to a real rule. Without it ESLint 10 raises a hard
    // "Definition for rule not found" error, which fails Quality Checks and
    // blocks the deploy pipeline.
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },
)
