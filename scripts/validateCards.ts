// scripts/validateCards.ts
//
// Validates the structural conventions of card implementations and tests:
//   1. Every card implementation file has `export default class <Name>` where
//      <Name> matches the file's basename. Comparison strips hyphens from the
//      basename and any leading underscore from the class name (both are
//      forced by TypeScript identifier rules for filenames like `4-LOM`,
//      `AT-AT`, `501st`, etc.) and is case-sensitive.
//   2. Every card implementation file has a matching test file at the mirrored
//      path under `test/server/cards/...` ending in `.spec.ts`.
//      Exempt from this check:
//        - files under a `tokens/` directory
//        - files whose `extends` clause references a class imported from a
//          `../common/...` (or deeper) module (those cards share a test under
//          their common superclass).
//        - files containing a line `// @no-test-required: <reason>` where
//          <reason> is non-empty. An exemption without a reason is itself a
//          violation, and an exemption alongside an existing test is flagged
//          as `unused-exemption` so stale markers get cleaned up.
//   3. Every `.ts` file under `test/server/cards/` ends in `.spec.ts`.
//
// Skipped from all checks (mirrors server/game/cards/Index.ts loader semantics):
//   - `common/` directories (abstract base classes / shared impls)
//   - The cards-root `Index.ts` registration file
//
// Prints a markdown table of violations (if any) and exits with code 1 so a
// GitHub Action can fail the PR. Exits 0 when clean.

import { lstatSync, readdirSync } from 'fs';
import { join, relative, sep } from 'path';
import { readFileSync } from 'fs';

const repoRoot = join(__dirname, '..');
const cardsDir = join(repoRoot, 'server', 'game', 'cards');
const testsDir = join(repoRoot, 'test', 'server', 'cards');

interface Violation {
    file: string;
    check: string;
    detail: string;
}

const CLASS_NAME_CHECK = 'default-class-name';
const MISSING_TEST_CHECK = 'missing-test-file';
const STRAY_TEST_CHECK = 'test-file-extension';
const EXEMPTION_MISSING_REASON_CHECK = 'exemption-missing-reason';
const UNUSED_EXEMPTION_CHECK = 'unused-exemption';

// Matches a well-formed exemption marker: `// @no-test-required: <reason>`.
// The colon and a non-empty reason are required. Capture group 1 is the reason.
const NO_TEST_REQUIRED_RE = /^[ \t]*\/\/[ \t]*@no-test-required[ \t]*:[ \t]*(\S.*?)[ \t]*$/m;

// Matches any line that looks like an attempt to use the marker, well-formed
// or not. Used to surface malformed markers (missing/empty reason) as a
// distinct violation rather than silently treating them as `missing-test-file`.
const NO_TEST_REQUIRED_MARKER_RE = /^[ \t]*\/\/[ \t]*@no-test-required\b.*$/m;

function isSkippedDir(name: string): boolean {
    return name === 'common';
}

function walkTsFiles(root: string): string[] {
    const results: string[] = [];
    const stack: string[] = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        if (current === undefined) {
            break;
        }
        let entries: string[];
        try {
            entries = readdirSync(current);
        } catch {
            continue;
        }
        for (const entry of entries) {
            const full = join(current, entry);
            const stat = lstatSync(full);
            if (stat.isDirectory()) {
                if (isSkippedDir(entry)) {
                    continue;
                }
                stack.push(full);
            } else if (stat.isFile() && entry.endsWith('.ts')) {
                results.push(full);
            }
        }
    }
    return results;
}

function fileExists(path: string): boolean {
    try {
        return lstatSync(path).isFile();
    } catch {
        return false;
    }
}

function isInTokensDir(relPath: string): boolean {
    const parts = relPath.split(sep);
    return parts.includes('tokens');
}

/**
 * Returns true if the card source extends a class imported from a `common/`
 * sibling/ancestor module. Such cards intentionally share a single test file
 * under their common superclass and are exempt from the missing-test check.
 */
function extendsCommonBase(source: string): boolean {
    const extendsMatch = source.match(/export\s+default\s+class\s+[A-Za-z0-9_]+\s+extends\s+([A-Za-z0-9_]+)\b/);
    if (!extendsMatch) {
        return false;
    }
    const superName = extendsMatch[1];
    // Look for an import of that symbol from a path containing `/common/`.
    const importRegex = new RegExp(
        String.raw`import\s+(?:type\s+)?\{[^}]*\b` + superName + String.raw`\b[^}]*\}\s+from\s+['"]([^'"]+)['"]`
    );
    const importMatch = source.match(importRegex);
    if (!importMatch) {
        return false;
    }
    return (/(^|\/)common\//).test(importMatch[1]);
}

/**
 * Normalize a card-file basename and its default-class name into a common form
 * for comparison. Strips hyphens from the basename (required because `-` is
 * not allowed in TS identifiers, e.g. `AT-AT`, `4-LOM`) and a leading
 * underscore from the class name (required when the basename starts with a
 * digit, e.g. `501stVeteran` -> `_501stVeteran`). Comparison is then
 * case-sensitive.
 */
function classNameMatchesBaseName(className: string, baseName: string): boolean {
    const normalizedBase = baseName.replace(/-/g, '');
    const normalizedClass = className.replace(/^_+/, '');
    return normalizedBase === normalizedClass;
}

let exemptedCount = 0;

function checkCards(violations: Violation[]): number {
    const cardFiles = walkTsFiles(cardsDir).filter((f) => {
        // Exclude the cards-root Index.ts registration file.
        return relative(cardsDir, f) !== 'Index.ts';
    });

    const classNameRegex = /export\s+default\s+class\s+([A-Za-z0-9_]+)\b/;

    for (const filePath of cardFiles) {
        const relPath = relative(repoRoot, filePath).split(sep)
            .join('/');
        const baseName = (filePath.split(sep).pop() ?? '').replace(/\.ts$/, '');

        // Check 1: default class name matches file name (after normalization).
        const source = readFileSync(filePath, 'utf8');
        const match = source.match(classNameRegex);
        if (!match) {
            violations.push({
                file: relPath,
                check: CLASS_NAME_CHECK,
                detail: `no \`export default class\` declaration found (expected class \`${baseName}\`)`,
            });
        } else if (!classNameMatchesBaseName(match[1], baseName)) {
            violations.push({
                file: relPath,
                check: CLASS_NAME_CHECK,
                detail: `default class is \`${match[1]}\` but file name implies \`${baseName}\``,
            });
        }

        // Check 2: matching test file exists (tokens and common-base subclasses exempt).
        const relFromCards = relative(cardsDir, filePath);
        const exemptionMatch = source.match(NO_TEST_REQUIRED_RE);
        const hasMalformedMarker = exemptionMatch === null && NO_TEST_REQUIRED_MARKER_RE.test(source);
        const expectedTest = join(testsDir, relFromCards).replace(/\.ts$/, '.spec.ts');
        const expectedRel = relative(repoRoot, expectedTest).split(sep)
            .join('/');

        if (exemptionMatch !== null) {
            if (fileExists(expectedTest)) {
                violations.push({
                    file: relPath,
                    check: UNUSED_EXEMPTION_CHECK,
                    detail: `test file \`${expectedRel}\` exists; remove the \`@no-test-required\` marker`,
                });
            } else {
                exemptedCount++;
            }
        } else if (hasMalformedMarker) {
            violations.push({
                file: relPath,
                check: EXEMPTION_MISSING_REASON_CHECK,
                detail: '`@no-test-required` marker must be of the form `// @no-test-required: <reason>` with a non-empty reason',
            });
        } else if (!isInTokensDir(relFromCards) && !extendsCommonBase(source)) {
            if (!fileExists(expectedTest)) {
                violations.push({
                    file: relPath,
                    check: MISSING_TEST_CHECK,
                    detail: `expected test file \`${expectedRel}\`. If this card is exempt from having its own test file, add a line like \`// @no-test-required: <reason>\` to the .ts file with an explanation.`,
                });
            }
        }
    }

    return cardFiles.length;
}

function checkTests(violations: Violation[]): number {
    const testFiles = walkTsFiles(testsDir);
    for (const filePath of testFiles) {
        if (!filePath.endsWith('.spec.ts')) {
            const relPath = relative(repoRoot, filePath).split(sep)
                .join('/');
            violations.push({
                file: relPath,
                check: STRAY_TEST_CHECK,
                detail: 'test file must end with `.spec.ts`',
            });
        }
    }
    return testFiles.length;
}

function printReport(violations: Violation[], cardCount: number, testCount: number): void {
    const exemptSuffix = exemptedCount > 0 ? ` (${exemptedCount} exempt)` : '';
    if (violations.length === 0) {
        console.log(
            `All card validations passed (${cardCount} card files${exemptSuffix}, ${testCount} test files checked).`
        );
        return;
    }

    // Column widths.
    const headers = ['File', 'Check', 'Detail'];
    const rows = violations.map((v) => [v.file, v.check, v.detail]);
    const widths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => r[i].length))
    );

    const pad = (s: string, w: number) => s + ' '.repeat(w - s.length);
    const formatRow = (cells: string[]) =>
        '| ' + cells.map((c, i) => pad(c, widths[i])).join(' | ') + ' |';
    const separator =
        '| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |';


    console.log(`\nCard validation found ${violations.length} violation(s):\n`);

    console.log(formatRow(headers));

    console.log(separator);
    for (const row of rows) {
        console.log(formatRow(row));
    }

    console.log(
        `\nChecked ${cardCount} card files${exemptSuffix} and ${testCount} test files.`
    );
}

function main(): void {
    const violations: Violation[] = [];
    const cardCount = checkCards(violations);
    const testCount = checkTests(violations);
    printReport(violations, cardCount, testCount);
    if (violations.length > 0) {
        process.exit(1);
    }
}

main();
