import jasmine from "eslint-plugin-jasmine";
import globals from "globals";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js'

export default tseslint.config(
  {
    ignores: ["build/**", "legacy_jigoku/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    // ignores: ["build/**", "legacy_jigoku/**"],
    ...eslint.configs.recommended,
    ...jasmine.configs.recommended,
    plugins: {
        jasmine,
        '@stylistic/js': stylisticJs,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jasmine,
        },

        ecmaVersion: 2020,
        sourceType: "commonjs",
    },

    rules: {
        "jasmine/no-spec-dupes": 0,
        "jasmine/no-suite-dupes": 0,
        "jasmine/missing-expect": 1,
        "jasmine/new-line-before-expect": 0,
        "jasmine/prefer-toHaveBeenCalledWith": 0,

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        quotes: ["error", "single"],
        "global-strict": 0,
        "brace-style": ["error", "1tbs"],
        "no-sparse-arrays": ["warn"],
        eqeqeq: ["error", "smart"],
        "no-else-return": ["error"],
        "no-extra-bind": ["error"],
        curly: ["error", "all"],
        "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
        "no-invalid-this": ["error"],
        "no-useless-escape": ["warn"],
        "no-useless-concat": ["warn"],
        "no-useless-constructor": ["warn"],
        "array-bracket-spacing": ["error", "never"],
        "block-spacing": ["error", "always"],
        "eol-last": ["off"],

        camelcase: ["error", {
            properties: "always",
        }],

        "comma-dangle": ["warn"],
        "space-before-blocks": ["error"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": ["error"],
        "no-multiple-empty-lines": ["error"],
        semi: ["error"],
        "no-unused-vars": ["warn", {
            "vars": "local",
            "args": "none"
        }],

        "no-trailing-spaces": ["error"],
    },
  },
  {
    files: ["**/*.ts"],
    ignores: ["test/**"],
    extends: [
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic,
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {
            "vars": "local",
        }],
        "@typescript-eslint/no-explicit-any": ["warn"],
        "@typescript-eslint/no-inferrable-types": ["error", {
            "ignoreParameters": true
        }],
        "@typescript-eslint/consistent-type-assertions": ["error", {
            "assertionStyle": "as",
            "objectLiteralTypeAssertions": "never"
        }],
        "@typescript-eslint/ban-ts-comment": ["warn"],
        "@typescript-eslint/no-unused-vars": ["warn"]
    }
  }
);
