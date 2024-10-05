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
        files: ["**/*.js", "**/*.ts"],
        ...jasmine.configs.recommended,
        ...eslint.configs.recommended,
        extends: [
            stylisticJs.configs['all-flat']
        ],
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
            "jasmine/new-line-between-declarations": 2,

            "@stylistic/js/spaced-comment": ["error", "always"],
            "@stylistic/js/function-call-spacing": ["error", "never"],
            "@stylistic/js/padded-blocks": ["error", "never"],
            "@stylistic/js/object-curly-spacing": ["error", "always"],
            "@stylistic/js/function-paren-newline": ["off"],
            "@stylistic/js/function-call-argument-newline": ["off"],
            "@stylistic/js/object-property-newline": ["off"],
            "@stylistic/js/space-before-function-paren": ["off"],
            "@stylistic/js/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
            "@stylistic/js/quote-props": ["error", "as-needed"],
            "@stylistic/js/array-element-newline": ["off"],
            "@stylistic/js/multiline-ternary": ["off"],
            "@stylistic/js/array-bracket-newline": ["off"],
            "@stylistic/js/implicit-arrow-linebreak": ["off"],
            "@stylistic/js/no-multi-spaces": ["error", { "ignoreEOLComments": true }],
            "@stylistic/js/multiline-comment-style": ["off"],
            "@stylistic/js/dot-location": ["error", "property"],
            "@stylistic/js/no-extra-parens": ["off"],
            "@stylistic/js/comma-dangle": ["error", "only-multiline"],
            "@stylistic/js/eol-last": ["off"],
            "@stylistic/js/quotes": ["error", "single"],
            "@stylistic/js/indent": ["error", 4, {
                "SwitchCase": 1,
            }],
            "@stylistic/js/lines-around-comment": ["error", {
                "beforeBlockComment": true,
                "afterBlockComment": false,
                "beforeLineComment": false,
                "afterLineComment": false,
                "allowBlockStart": true,
                "allowBlockEnd": true,
                "allowObjectStart": true,
                "allowObjectEnd": true,
                "allowArrayStart": true,
                "allowArrayEnd": true,
                "allowClassStart": true,
                "allowClassEnd": true,
            }],

            "global-strict": 0,
            "brace-style": ["error", "1tbs"],
            "no-sparse-arrays": ["warn"],
            eqeqeq: ["error", "always", { "null": "ignore" }],
            "no-else-return": ["error"],
            "no-extra-bind": ["error"],
            curly: ["error", "all"],
            "no-invalid-this": ["error"],
            "no-useless-escape": ["warn"],
            "no-useless-concat": ["warn"],
            "no-useless-constructor": ["warn"],
            "array-bracket-spacing": ["error", "never"],
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
            "@typescript-eslint/no-unused-vars": ["warn"],
            "@typescript-eslint/prefer-namespace-keyword": "off",
            "@typescript-eslint/explicit-member-accessibility": "error",
            "@typescript-eslint/no-namespace": "off"
        }
    }
);
