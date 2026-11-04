// Writes the registry tables of SPEC.md from registry/*.json, between
// <!-- registry:NAME --> and <!-- /registry:NAME --> markers. `--check` fails if SPEC.md differs.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const specPath = join(packageDir, 'SPEC.md');

function load(name) {
    return JSON.parse(readFileSync(join(packageDir, 'registry', `${name}.json`), 'utf8'));
}

/** A table cell: pipes escaped, line breaks flattened. */
function cell(value) {
    return String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
}

function code(value) {
    return `\`${value}\``;
}

function table(headings, rows) {
    const lines = [
        `| ${headings.join(' | ')} |`,
        `|${headings.map(() => '---').join('|')}|`,
        ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
    ];
    return lines.join('\n');
}

const generators = {
    attributes: () => table(
        ['Name', 'Type', 'Class', 'On', 'Meaning', 'CR'],
        load('attributes').map((a) => [code(a.name), code(a.type), a.class, a.on.join(', '), a.meaning, a.cr ?? '—'])
    ),
    zones: () => table(
        ['Zone', 'Meaning', 'Owner sees', 'Opponent sees'],
        load('zones').map((z) => [code(z.name), z.meaning, z.ownerSees, z.opponentSees])
    ),
    relations: () => table(
        ['Relation', 'Parent', 'Meaning'],
        load('relations').map((r) => [code(r.name), r.parent, r.meaning])
    ),
    blockKinds: () => table(
        ['Kind', 'Meaning', 'Required', 'Optional', 'Fields mean'],
        load('blockKinds').map((k) => {
            const fields = Object.entries(k.fields);
            const named = (use) => fields.filter(([, f]) => f.use === use).map(([name]) => code(name)).join(', ') || '—';
            const meanings = fields.filter(([, f]) => f.meaning).map(([name, f]) => `${code(name)}: ${f.meaning}`).join(' ') || '—';
            return [code(k.name), k.meaning, named('required'), named('optional'), meanings];
        })
    ),
    setCodes: () => table(
        ['Release', 'Code'],
        load('setCodes').map((s) => [s.release, code(s.code)])
    ),
    errorCodes: () => table(
        ['Code', 'Severity', 'Applies to', 'Condition'],
        load('errorCodes').map((e) => [code(e.code), e.severity, e.scope === 'api' ? 'an SDK call' : 'a file', e.condition])
    ),
};

const original = readFileSync(specPath, 'utf8');
let text = original;
const problems = [];
for (const [name, generate] of Object.entries(generators)) {
    const pattern = new RegExp(`(<!-- registry:${name} -->\\n)[\\s\\S]*?(\\n?<!-- /registry:${name} -->)`, 'g');
    const matches = text.match(pattern) ?? [];
    if (matches.length !== 1) {
        problems.push(`SPEC.md has ${matches.length} <!-- registry:${name} --> blocks, expected 1`);
        continue;
    }
    text = text.replace(pattern, (_all, open) => `${open}${generate()}\n<!-- /registry:${name} -->`);
}

if (checkOnly && text !== original) {
    problems.push('SPEC.md registry tables are stale (run npm run generate -w @swupgn/format)');
}
for (const problem of problems) {
    console.error(problem);
}
if (!checkOnly && problems.length === 0 && text !== original) {
    writeFileSync(specPath, text);
}
process.exit(problems.length > 0 ? 1 : 0);
