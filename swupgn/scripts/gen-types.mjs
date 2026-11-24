// Generates src/generated/* from schema/ and registry/. `--check` fails if the committed files differ.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const schemaPath = join(packageDir, 'schema', 'swupgn.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

// Types, in the order of Shared interfaces. Everything in $defs is emitted under its title.
const roots = ['seat', 'entityId', 'audience', 'attrValue', 'attrs', 'create', 'set', 'remove', 'reveal', 'step', 'block', 'record', 'deckLine', 'cardLine', 'annotation', 'entity', 'board', 'header', 'file'];

// TS-only overrides live beside the generator so the published schema stays plain JSON Schema.
// Keys are slash-separated paths into the schema; each value becomes that node's tsType.
const overrides = JSON.parse(readFileSync(join(packageDir, 'scripts', 'type-overrides.json'), 'utf8'));
const typed = structuredClone(schema);
for (const [pointer, tsType] of Object.entries(overrides)) {
    let node = typed;
    for (const key of pointer.split('/')) {
        node = node[key];
    }
    node.tsType = tsType;
}

const wrapper = {
    title: 'GeneratedRoot',
    type: 'object',
    properties: Object.fromEntries(roots.map((name) => [name, { $ref: `#/$defs/${name}` }])),
    $defs: typed.$defs,
};

const compiled = await compile(wrapper, 'GeneratedRoot', {
    bannerComment: '',
    additionalProperties: false,
    declareExternallyReferenced: true,
    format: true,
    style: { singleQuote: true, tabWidth: 4 },
    unreachableDefinitions: true,
});

// The wrapper only exists to reach the defs: drop its interface and the "referenced by" notes.
const body = compiled
    .replace(/export interface GeneratedRoot \{[\s\S]*?\n\}\n/, '')
    .replace(/\n \*\s*\n \* This interface was referenced by[^\n]*\n \* via the `definition` "[^"]*"\./g, '')
    .replace(/\/\*\*\n \* This interface was referenced by[^\n]*\n \* via the `definition` "[^"]*"\.\n \*\/\n/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const outputs = new Map();
outputs.set('src/generated/types.ts', '// GENERATED from schema/swupgn.schema.json — do not edit\n\n' + body + '\n');

// The schema and registry as TS modules: Node ESM cannot import bare .json, and the package must run as ESM and CJS.
const banner = '// GENERATED from schema/ and registry/ — do not edit\n\n';
outputs.set('src/generated/schema.ts', `${banner}export const schema = ${JSON.stringify(schema, null, 4)};\n`);
const registryDir = join(packageDir, 'registry');
for (const file of readdirSync(registryDir).filter((f) => f.endsWith('.json') && f !== 'registry.schema.json').sort()) {
    const name = file.replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(join(registryDir, file), 'utf8'));
    outputs.set(`src/generated/registry/${name}.ts`, `${banner}export const ${name} = ${JSON.stringify(data, null, 4)};\n`);
}

let stale = false;
for (const [rel, content] of outputs) {
    const full = join(packageDir, rel);
    if (checkOnly) {
        if (!existsSync(full) || readFileSync(full, 'utf8') !== content) {
            console.error(`stale generated file: ${rel} (run npm run generate -w @swupgn/format)`);
            stale = true;
        }
    } else {
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, content);
    }
}
process.exit(stale ? 1 : 0);
