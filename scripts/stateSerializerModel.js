// Pure (no ts-morph, no filesystem side effects beyond reading) building blocks for the codegen state
// serializer generator (Plan 3, docs/plans/03-codegen-serializers.md, Phase A step 1). Kept separate from
// scripts/stateSerializerGenerator.js so these decision rules are unit-testable without paying ts-morph's
// load cost, and separate from scripts/generate-state-serializers.js so the CLI entry stays thin.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Decorator names the cheap text scan looks for. Includes the two register decorators and all seven field
// decorators, so a file using only field decorators (impossible on main today, but not structurally ruled
// out) still gets caught by the scan.
// P3-PB1: stateMap/stateSet/stateArray are additive scan/kind entries only - both map to kind 'value',
// identically to stateValue (see GameObjectUtils.ts's stateMap/stateSet/stateArray doc comments), so this
// addition is provably inert for every downstream consumer of `kind` (verified: plan_v2.md §1.2/§5 item 1's
// before/after artifact diff).
const DECORATOR_SCAN_NAMES = [
    '@registerState',
    '@registerStateBase',
    '@statePrimitive',
    '@stateValue',
    '@stateMap',
    '@stateSet',
    '@stateArray',
    '@stateRef',
    '@stateRefArray',
    '@stateRefMap',
    '@stateRefSet',
    '@stateRefRecord',
];

const REGISTER_DECORATOR_NAMES = new Set(['registerState', 'registerStateBase']);

const FIELD_DECORATOR_TO_KIND = new Map([
    ['statePrimitive', 'primitive'],
    ['stateValue', 'value'],
    ['stateMap', 'value'],
    ['stateSet', 'value'],
    ['stateArray', 'value'],
    ['stateRef', 'ref'],
    ['stateRefArray', 'refArray'],
    ['stateRefMap', 'refMap'],
    ['stateRefSet', 'refSet'],
    ['stateRefRecord', 'refRecord'],
]);

// Duplicated from server/game/core/StateEncoding.ts's STATE_ENCODING_TAGS / STATE_RECORD_FORMAT_VERSION.
// The generator is plain CommonJS (plan §3.2: no ts-node on the cold build path), so it cannot import the
// TypeScript leaf module directly; these two literals must be kept identical to StateEncoding.ts by hand,
// and a mismatch here would only ever under- or over-invalidate the schema-surface hash, never corrupt a
// record, since encode/decode still runs from StateEncoding.ts at runtime.
const STATE_ENCODING_TAGS = ['$map', '$set', '$num'];
const STATE_RECORD_FORMAT_VERSION = 1;

const CACHE_HEADER_BEGIN = '/* generation-cache-begin';
const CACHE_HEADER_END = 'generation-cache-end */';

function toPosixRelative(repoRoot, absOrRelPath) {
    const rel = path.isAbsolute(absOrRelPath) ? path.relative(repoRoot, absOrRelPath) : absOrRelPath;
    return rel.split(path.sep)
        .join('/');
}

function walkTsFiles(dir, acc) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkTsFiles(full, acc);
        } else if (entry.name.endsWith('.ts')) {
            acc.push(full);
        }
    }
    return acc;
}

// Cheap decorator-name text scan across server/**/*.ts. Returns repo-relative, forward-slash normalized
// paths, sorted. This is a candidate set, not the final visited set: a mixin factory file with no
// decorator name in it (AllAbilityTypeRegistrations.ts) will not appear here, which is exactly why the
// generation hash also folds in the previous run's visited-file list (see computeGenerationHash callers).
function collectCandidateFiles(repoRoot) {
    const serverDir = path.join(repoRoot, 'server');
    const files = walkTsFiles(serverDir, []);
    const candidates = [];
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf8');
        if (DECORATOR_SCAN_NAMES.some((name) => text.includes(name))) {
            candidates.push(toPosixRelative(repoRoot, file));
        }
    }
    return candidates.sort();
}

// Hashes the sorted, de-duplicated union of `filePaths` (repo-relative, forward-slash or backslash - both
// normalized here) plus `extraInputs` (opaque strings folded in as-is, e.g. the format version). A missing
// or unreadable file makes this a cache miss: returns null rather than throwing, so a renamed or deleted
// previously-visited file is handled as "go cold", not as a crash.
function computeGenerationHash(repoRoot, filePaths, extraInputs = []) {
    const normalized = Array.from(new Set(filePaths.map((p) => toPosixRelative(repoRoot, p)))).sort();
    const hash = crypto.createHash('sha256');
    for (const rel of normalized) {
        let content;
        try {
            content = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
        } catch {
            return null;
        }
        hash.update(rel);
        hash.update('\0');
        hash.update(content);
        hash.update('\0');
    }
    for (const extra of extraInputs) {
        hash.update(String(extra));
        hash.update('\0');
    }
    return hash.digest('hex');
}

// Renders the machine-parseable cache header embedded at the top of the generated artifact.
function renderArtifactCacheHeader(meta) {
    const payload = JSON.stringify({
        formatVersion: meta.formatVersion,
        generationHash: meta.generationHash,
        visitedFiles: meta.visitedFiles.slice()
            .sort(),
    });
    return `${CACHE_HEADER_BEGIN}\n${payload}\n${CACHE_HEADER_END}`;
}

// Parses the cache header out of the artifact's leading text. A missing or unparseable header is cold
// (returns null), never mistaken for a hit - a truncated write must not be read back as valid.
function readArtifactCacheHeader(text) {
    const beginIndex = text.indexOf(CACHE_HEADER_BEGIN);
    if (beginIndex === -1) {
        return null;
    }
    const endIndex = text.indexOf(CACHE_HEADER_END, beginIndex);
    if (endIndex === -1) {
        return null;
    }
    const jsonText = text.slice(beginIndex + CACHE_HEADER_BEGIN.length, endIndex).trim();
    try {
        const parsed = JSON.parse(jsonText);
        if (typeof parsed !== 'object' || parsed === null || typeof parsed.generationHash !== 'string' || !Array.isArray(parsed.visitedFiles)) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

// Schema-surface hash: the save-compatibility gate Plan 6 checks. Inputs are exactly the resolved model's
// class -> field shape (never file text), the tag vocabulary, and the format version - nothing else, so
// comment edits, import reordering, declaration-order churn, and an isAbstract/decorator-kind flip cannot
// move it, while a field rename, a field-kind change, a class add/remove, a new tag, or a format-version
// bump all do.
function computeSchemaSurfaceHash(model, tags, formatVersion) {
    const classLines = model
        .map((target) => {
            const fieldPairs = target.fields
                .map((field) => `${field.name}:${field.kind}`)
                .sort();
            return `${target.name}=>${fieldPairs.join(',')}`;
        })
        .sort();
    const hash = crypto.createHash('sha256');
    hash.update(classLines.join('\n'));
    hash.update('\0');
    hash.update(tags.slice()
        .sort()
        .join(','));
    hash.update('\0');
    hash.update(String(formatVersion));
    return hash.digest('hex');
}

// Keeps only top-level (module-scope) registered classes as serializer targets, per the structural rule
// (plan §4.1): a class declared inside a mixin factory function body is a fragment, never an instance's own
// constructor, and must never be a registry key.
function selectTargets(rawClasses) {
    return rawClasses.filter((rawClass) => !rawClass.declaredInFunction);
}

// Generation-time hard failures (plan §4.2, rules 1-2). `targets` entries: { name, decorator, isAbstract,
// isExported, file }.
function assertModelIsGeneratable(targets) {
    const byName = new Map();
    for (const target of targets) {
        if (byName.has(target.name)) {
            const prior = byName.get(target.name);
            throw new Error(
                `Duplicate registered serializer target name "${target.name}": declared at both ${prior.file} and ${target.file}. Registry keys are class names, so two top-level registered classes cannot share one.`
            );
        }
        byName.set(target.name, target);
    }

    for (const target of targets) {
        if (!target.isAbstract && !target.isExported) {
            throw new Error(
                `Module-local registered class "${target.name}" (${target.decorator}) at ${target.file} would become a non-abstract serializer registry key but is not exported. Export it (a named export is enough) so Plan 5's name -> constructor factory can resolve it, or mark it abstract if it is never instantiated directly.`
            );
        }
    }
}

module.exports = {
    STATE_ENCODING_TAGS,
    STATE_RECORD_FORMAT_VERSION,
    DECORATOR_SCAN_NAMES,
    REGISTER_DECORATOR_NAMES,
    FIELD_DECORATOR_TO_KIND,
    toPosixRelative,
    collectCandidateFiles,
    computeGenerationHash,
    renderArtifactCacheHeader,
    readArtifactCacheHeader,
    computeSchemaSurfaceHash,
    selectTargets,
    assertModelIsGeneratable,
};
