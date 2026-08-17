const base = require("@gridcore/config/eslint/react-app");

/*
 * The design system lints like an app, with one exception.
 *
 * `../../*` is banned in an app because every app has an `@/` alias. A library
 * does not: that alias only exists inside this package's own tsconfig, so a
 * consumer resolving `@/lib/utils` would fail. Relative paths are the correct
 * form here, which is why the shadcn components were rewritten to use them.
 */
const patterns = base.rules["no-restricted-imports"][1].patterns.filter(
  (p) => !p.group.includes("../../*")
);

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    "no-restricted-imports": ["error", { patterns }],
  },
};
