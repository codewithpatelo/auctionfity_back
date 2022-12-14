module.exports = {
    parser: "@typescript-eslint/parser",
  
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    env: {
      es6: true,
      node: true,
    },
    rules: {
      "no-var": "error",
      semi: "error",
      indent: ["error", 2, { SwitchCase: 1 }],
      "no-multi-spaces": "error",
      "space-in-parens": "error",
      "no-multiple-empty-lines": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  };
  