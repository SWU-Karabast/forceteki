import jasmine from "eslint-plugin-jasmine";
import globals from "globals";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginImportX from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
    {
        ignores: ["build/**", "legacy_jigoku/**", "node_modules/**"],
    },
    {
        files: ["**/*.js", "**/*.ts"],
        ...jasmine.configs.recommended,
        ...eslint.configs.recommended,
        ...eslintPluginImportX.flatConfigs.recommended,
        ...eslintPluginImportX.flatConfigs.typescript,
        extends: [
            stylistic.configs['all-flat']
        ],
        plugins: {
            jasmine,
            '@stylistic': stylistic,
            "unused-imports": unusedImports,
            'import-x': eslintPluginImportX
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

            "import-x/newline-after-import": ["error"],

            "@stylistic/spaced-comment": ["error", "always"],
            "@stylistic/function-call-spacing": ["error", "never"],
            "@stylistic/padded-blocks": ["error", "never"],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/function-paren-newline": ["off"],
            "@stylistic/function-call-argument-newline": ["off"],
            "@stylistic/object-property-newline": ["off"],
            "@stylistic/space-before-function-paren": ["off"],
            "@stylistic/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
            "@stylistic/quote-props": ["error", "as-needed"],
            "@stylistic/array-element-newline": ["off"],
            "@stylistic/multiline-ternary": ["off"],
            "@stylistic/array-bracket-newline": ["off"],
            "@stylistic/implicit-arrow-linebreak": ["off"],
            "@stylistic/no-multi-spaces": ["error", { "ignoreEOLComments": true }],
            "@stylistic/multiline-comment-style": ["off"],
            "@stylistic/dot-location": ["error", "property"],
            "@stylistic/no-extra-parens": ["off"],
            "@stylistic/comma-dangle": ["error", "only-multiline"],
            "@stylistic/eol-last": ["off"],
            "@stylistic/quotes": ["error", "single"],
            "@stylistic/indent": ["error", 4, {
                "SwitchCase": 1,
            }],
            "@stylistic/lines-around-comment": ["error", {
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

            // uncomment for checking import cycles (too slow to leave on all the time)
            // "import-x/no-cycle": ["error"],

            "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    "vars": "all",
                    "varsIgnorePattern": "^_",
                    "args": "after-used",
                    "argsIgnorePattern": "^_",
                },
            ]
        },
    },
    {
        files: ["**/*.ts"],
        ignores: ["test/**"],
        extends: [
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic,
        ],
        languageOptions: {
            // uncomment for checking import cycles (too slow to leave on all the time)
            // parser: tsParser,
            // sourceType: 'module'
            
            parserOptions: {
              projectService: true
            }
        },
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
            "@typescript-eslint/no-namespace": "off",
            "@stylistic/type-annotation-spacing": ["error"],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/consistent-type-exports": "error",

            // uncomment for checking import cycles (too slow to leave on all the time)
            // "import-x/no-cycle": ["error"],
        }
    },
    {
        files: ["test/**/*.ts"],
        extends: [
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic,
        ],
        rules: {
            "jasmine/no-spec-dupes": 0,
            "jasmine/no-suite-dupes": 0,
            "jasmine/missing-expect": 1,
            "jasmine/new-line-before-expect": 0,
            "jasmine/prefer-toHaveBeenCalledWith": 0,
            "jasmine/new-line-between-declarations": 2,

            "import-x/newline-after-import": ["error"],

            "@stylistic/spaced-comment": ["error", "always"],
            "@stylistic/function-call-spacing": ["error", "never"],
            "@stylistic/padded-blocks": ["error", "never"],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/function-paren-newline": ["off"],
            "@stylistic/function-call-argument-newline": ["off"],
            "@stylistic/object-property-newline": ["off"],
            "@stylistic/space-before-function-paren": ["off"],
            "@stylistic/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
            "@stylistic/quote-props": ["error", "as-needed"],
            "@stylistic/array-element-newline": ["off"],
            "@stylistic/multiline-ternary": ["off"],
            "@stylistic/array-bracket-newline": ["off"],
            "@stylistic/implicit-arrow-linebreak": ["off"],
            "@stylistic/no-multi-spaces": ["error", { "ignoreEOLComments": true }],
            "@stylistic/multiline-comment-style": ["off"],
            "@stylistic/dot-location": ["error", "property"],
            "@stylistic/no-extra-parens": ["off"],
            "@stylistic/comma-dangle": ["error", "only-multiline"],
            "@stylistic/eol-last": ["off"],
            "@stylistic/quotes": ["error", "single"],
            "@stylistic/indent": ["error", 4, {
                "SwitchCase": 1,
            }],
            "@stylistic/lines-around-comment": ["error", {
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
