import tseslint from "typescript-eslint";
// @ts-ignore -- no types for this plugin
import drizzle from "eslint-plugin-drizzle";
import nextVitals from "eslint-config-next/core-web-vitals";

export default tseslint.config(
  {
    ignores: [".next"],
  },
  ...nextVitals,
  {
    // eslint-plugin-react's "detect" React version lookup calls the removed
    // context.getFilename() API under ESLint 10, crashing every rule that
    // needs the version. Setting an explicit version skips that lookup.
    settings: {
      react: {
        version: "19",
      },
    },
  },
  {
    // eslint-config-next routes plain JS files through Next's vendored Babel
    // eslint parser, whose bundled scope manager predates the addGlobals()
    // method ESLint 10 requires, crashing the linter on every such file.
    // Route these files through the typescript-eslint parser instead, same
    // as .ts/.tsx already get from eslint-config-next's own override below.
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      drizzle,
    },
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "drizzle/enforce-delete-with-where": [
        "error",
        { drizzleObjectName: ["db", "ctx.db"] },
      ],
      "drizzle/enforce-update-with-where": [
        "error",
        { drizzleObjectName: ["db", "ctx.db"] },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);