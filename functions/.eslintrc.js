module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    ecmaVersion: 2020, // Added to align with target in tsconfig
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": [
      "error",
      {
        "code": 160, // Increased general code limit
        "ignoreComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn", // Changed from default error to warn
    "require-jsdoc": "off", // Disabled JSDoc requirement from 'google' style
    "valid-jsdoc": "off", // Disabled JSDoc validation
    "object-curly-spacing": ["error", "always"], // Enforce spaces inside braces
  },
};
