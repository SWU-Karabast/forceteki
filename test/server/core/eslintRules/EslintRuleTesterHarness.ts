import { RuleTester } from 'eslint';
import type { Linter, Rule } from 'eslint';
import tseslint from 'typescript-eslint';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

/**
 * Shared harness for exercising this repo's custom ESLint rules (`eslint-rules/*.mjs`) from the normal
 * jasmine suite, so a regression in one of them fails CI instead of going unnoticed until someone
 * hand-probes the rule again.
 *
 * Two mechanical problems this solves, both specific to driving `eslint`'s `RuleTester` from here:
 *
 * 1. The rules are native ESM (`.mjs`), while this test tree compiles to CommonJS
 *    (`test/tsconfig.json` sets `module: CommonJS`). TypeScript downlevels a CommonJS `await import()`
 *    into `require()`, which cannot load an `.mjs` file at all - so the import has to be hidden from the
 *    compiler to survive as a real dynamic `import()` at runtime (see `importEsm` below).
 * 2. `RuleTester.run` declares its own `describe`/`it` blocks, which would nest jasmine suites from
 *    inside a running spec. Pointing `RuleTester.describe`/`RuleTester.it` at plain pass-through
 *    functions makes `run` execute its cases inline and throw on failure, so each jasmine `it` in a
 *    spec file can own exactly one rule case and report it under its own name.
 */

// A real, untranspiled dynamic `import()`. `new Function` keeps this out of TypeScript's module
// transform; writing `await import(...)` directly here would compile to `require(...)` and fail on the
// `.mjs` rule files. See point 1 above.
const importEsm = new Function('specifier', 'return import(specifier);') as
    (specifier: string) => Promise<{ default: Rule.RuleModule }>;

// Run RuleTester's cases inline rather than registering nested jasmine suites. See point 2 above.
RuleTester.describe = (_name: string, callback: () => void) => callback();
RuleTester.it = (_name: string, callback: () => void) => callback();

// Reached through the `typescript-eslint` umbrella package rather than `@typescript-eslint/parser`
// directly: the parser package is `exports`-only, which this tree's `moduleResolution: node` cannot
// resolve, while the umbrella package also publishes a top-level `types` entry and so does resolve.
const tsParser = tseslint.parser as unknown as Linter.Parser;

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

/**
 * Locates the repo's `eslint-rules/` directory by walking up from this module. Resolved this way rather
 * than by a fixed relative path because this file runs from `build/test/...`, one directory deeper than
 * its `test/...` source, and rather than from `process.cwd()` because that only holds while the suite is
 * launched from the repo root.
 */
function findEslintRulesDir(): string {
    let dir = __dirname;
    while (true) {
        const candidate = path.join(dir, 'eslint-rules');
        if (fs.existsSync(candidate)) {
            return candidate;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new Error(`Could not locate an eslint-rules/ directory above ${__dirname}`);
        }
        dir = parent;
    }
}

const ruleModuleCache = new Map<string, Promise<Rule.RuleModule>>();

/** Loads a rule by its `eslint-rules/` file basename, e.g. `no-event-generated-tokens`. */
export function loadForcetekiRule(ruleName: string): Promise<Rule.RuleModule> {
    let cached = ruleModuleCache.get(ruleName);
    if (!cached) {
        const ruleFile = path.join(findEslintRulesDir(), `${ruleName}.mjs`);
        if (!fs.existsSync(ruleFile)) {
            throw new Error(`No such custom ESLint rule: ${ruleFile}`);
        }

        // `pathToFileURL` is required on Windows: a bare `C:\...` path is not a valid import specifier.
        cached = importEsm(pathToFileURL(ruleFile).href).then((module) => module.default);
        ruleModuleCache.set(ruleName, cached);
    }
    return cached;
}

/** Asserts that `code` produces exactly one report of `messageId` from `ruleName`. */
export async function expectRuleReports(ruleName: string, code: string, messageId: string): Promise<void> {
    const rule = await loadForcetekiRule(ruleName);
    ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [{ code, filename: 'file.ts', errors: [{ messageId }] }],
    });
}

/** Asserts that `code` produces no report at all from `ruleName`. */
export async function expectRuleClean(ruleName: string, code: string): Promise<void> {
    const rule = await loadForcetekiRule(ruleName);
    ruleTester.run(ruleName, rule, {
        valid: [{ code, filename: 'file.ts' }],
        invalid: [],
    });
}
