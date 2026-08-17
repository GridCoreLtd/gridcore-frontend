/**
 * Shared lint rules for the Vite + React Router apps.
 *
 * This file is the enforcement half of architecture/11-frontend-conventions.md.
 * Every 🔒 rule in that doc should be represented here — if a convention can't
 * be enforced, it belongs in the review section of the doc, not in this file.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: [
    "@typescript-eslint",
    "react-refresh",
    "import",
    "check-file",
    "boundaries",
  ],
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { alwaysTryTypes: true },
    },

    /*
     * §2 — the layers. Order matters: the first pattern that matches a file
     * wins, so the most specific paths come first.
     *
     * Only the console has `features/` and `entities/` today; in the customer
     * and website apps every file lands in `app`, `page` or `shared`, which is
     * why those two need no rules of their own.
     */
    "boundaries/elements": [
      { type: "app", pattern: "src/{main,App}.{ts,tsx}", mode: "full" },
      { type: "app", pattern: "src/{routes,layouts}", mode: "folder" },
      { type: "page", pattern: "src/pages", mode: "folder" },
      {
        type: "feature",
        pattern: "src/features/*",
        mode: "folder",
        capture: ["family"],
      },
      {
        type: "entity",
        pattern: "src/entities/*",
        mode: "folder",
        capture: ["family"],
      },
      /*
       * The shared kernel. `auth` and `store` live here rather than in `app`
       * on purpose: the session is a cross-cutting primitive that every layer
       * legitimately reads (`useScopes()` decides what a feature renders).
       * Putting it above features would make the one import every feature
       * needs a layer violation.
       */
      {
        type: "shared",
        pattern:
          "src/{components,hooks,utils,styles,data,schema,assets,auth,store}",
        mode: "folder",
      },
    ],
    "boundaries/ignore": ["**/*.d.ts", "**/*.test.{ts,tsx}"],
  },
  ignorePatterns: [
    "dist",
    "build",
    "node_modules",
    "*.cjs",
    "*.config.*",
    // Astro regenerates this on every sync; anything written here is lost.
    "src/env.d.ts",
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

    // The ported code has plenty of `any` from the untyped axios layer.
    // packages/api-client (generated from OpenAPI) is what actually fixes
    // this — keep it a warning until then rather than blocking the port.
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "react/prop-types": "off",

    // §4 — type-only imports. Required by verbatimModuleSyntax on the website.
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],

    // §4 — import order.
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        pathGroups: [
          { pattern: "react", group: "external", position: "before" },
          { pattern: "@gridcore/**", group: "internal", position: "before" },
          { pattern: "@/**", group: "internal" },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],

    // §1, §2, §5 — the hard boundaries.
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/apps/*", "@gridcore/console/*", "@gridcore/customer/*", "@gridcore/website/*"],
            message:
              "Apps must not import from other apps. Move the shared code into packages/ — see architecture/11-frontend-conventions.md §1.",
          },
          {
            group: ["../../*"],
            message:
              "Use the @/ alias instead of climbing directories. §4.",
          },
          {
            group: ["@heroicons/*"],
            message:
              "Heroicons is being removed. Use lucide-react — see §5.",
          },
          {
            group: ["react-icons", "react-icons/*"],
            message:
              "One icon set only. Use lucide-react — see §5.",
          },
          {
            group: ["@headlessui/*"],
            message:
              "Use the shadcn primitives in @gridcore/ui (Dialog, Popover, DropdownMenu, Tabs) — see §5. Existing usages are migrated per-component.",
          },
        ],
      },
    ],

    /*
     * §3 — file naming. Patterns are micromatch extglobs:
     *   +([A-Z])*([a-zA-Z0-9])          PascalCase
     *   use+([A-Z])*([a-zA-Z0-9])       useSomething
     *   +([a-z])*(-+([a-z0-9]))         kebab-case
     *
     * .tsx may be PascalCase (a component) or a use-prefixed hook — plenty of
     * hooks are .tsx legitimately because they return JSX.
     */
    "check-file/filename-naming-convention": [
      "error",
      {
        "**/*.tsx":
          "@(+([A-Z])*([a-zA-Z0-9])|use+([A-Z])*([a-zA-Z0-9])|main|routes|index)",
        "**/*.ts":
          "@(+([a-z])*(-+([a-z0-9]))|use+([A-Z])*([a-zA-Z0-9])|+([A-Z])*([a-zA-Z0-9]))",
      },
      { ignoreMiddleExtensions: true },
    ],

    // §2 — feature folders are kebab-case domains, not PascalCase.
    "check-file/folder-naming-convention": [
      "error",
      { "src/features/*/": "KEBAB_CASE" },
    ],

    // §3 — barrels only as a feature's public surface.
    "check-file/no-index": "off",

    // §5 — no hard-coded brand colours. The palette lives in CSS variables in
    // packages/ui; a literal hex bypasses theming and dark mode.
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "Literal[value=/(?:bg|text|border|ring|fill|stroke|from|via|to)-\\[#[0-9a-fA-F]{3,8}\\]/]",
        message:
          "Hard-coded colour. Use a semantic token (bg-primary, text-muted-foreground) — see architecture/11-frontend-conventions.md §5.",
      },
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/\\bspace-[xy]-/]",
        message:
          "Use flex with gap-* instead of space-x-*/space-y-* (shadcn convention, §5).",
      },
    ],

    /*
     * §2 — dependencies point one way: app → page → feature → entity → shared.
     *
     * The rule that earns its keep is `feature → feature: disallowed`. Two
     * features needing the same component means that component belongs in
     * `entities/`, beneath them both — not inside whichever one happened to
     * be written first.
     *
     * A file may still reach its own feature's internals; that is the
     * `family: "${from.family}"` capture below.
     */
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        message:
          "${file.type} may not import ${dependency.type} — dependencies point one way: app → page → feature → entity → shared. See architecture/11-frontend-conventions.md §2.",
        rules: [
          { from: "app", allow: ["app", "page", "feature", "entity", "shared"] },
          { from: "page", allow: ["page", "feature", "entity", "shared"] },
          {
            from: "feature",
            allow: [
              ["feature", { family: "${from.family}" }],
              "entity",
              "shared",
            ],
            message:
              "A feature may not import another feature. Move the shared piece down into `entities/`, or compose both at the page. See §2.",
          },
          {
            from: "entity",
            allow: [["entity", { family: "${from.family}" }], "shared"],
          },
          { from: "shared", allow: ["shared"] },
        ],
      },
    ],

    // Nothing outside a feature may reach past its index.ts. This is the
    // barrel rule from §2, expressed where boundaries can see it.
    "boundaries/entry-point": [
      "error",
      {
        default: "disallow",
        rules: [
          { target: ["feature", "entity"], allow: "index.{ts,tsx}" },
          // Everything else is addressed by file path as before.
          { target: ["app", "page", "shared"], allow: "**" },
        ],
      },
    ],

    // A cycle is the failure mode the layers exist to prevent; catch it at the
    // commit that introduces it, not at a runtime `undefined is not a component`.
    "import/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true }],
  },

  overrides: [
    {
      /*
       * §9 legacy freeze. These trees are scheduled for deletion or a move, not
       * a rename — the console's abandoned components/ split, and the merchant/
       * namespace created by the app merge (blocked on the backend scoping list
       * endpoints by token). Renaming files there now would create churn in code
       * that is about to disappear.
       *
       * Naming is downgraded to a warning here, NOT disabled: the count stays
       * visible so the backlog can't quietly grow. Delete each entry as its
       * migration lands.
       */
      files: [
        "src/components/**/*.{ts,tsx}",
        "src/features/merchant/**/*.{ts,tsx}",
      ],
      rules: {
        "check-file/filename-naming-convention": "warn",
      },
    },
    {
      // Feature code must not reach past another feature's public surface.
      files: ["src/features/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/features/*/*"],
                message:
                  "Import a feature through its index.ts, not its internals: '@/features/payouts', not '@/features/payouts/components/X'. See §2.",
              },
              {
                group: ["@heroicons/*", "react-icons", "react-icons/*", "@headlessui/*"],
                message: "See §5 — use lucide-react and @gridcore/ui.",
              },
            ],
          },
        ],
      },
    },
    {
      // The interceptors are the one place a global error surface is tempting.
      files: ["src/utils/**/axios-instance.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "sonner",
                message:
                  "Interceptors must not toast — they only expire the session on 401. See §6 and architecture/10-api-errors.md.",
              },
              {
                name: "react-toastify",
                message:
                  "Interceptors must not toast — they only expire the session on 401. See §6.",
              },
            ],
          },
        ],
      },
    },
  ],
};
