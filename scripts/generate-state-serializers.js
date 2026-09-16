// CLI entry for the codegen state serializers (Plan 3, Phase A step 1). Prepended to every build script
// (scripts/build-server.js, scripts/build-dev.js, scripts/build-test.js, on every branch including
// --fast-build) so a stale or missing generated artifact is regenerated before tsc ever sees it. Cheap on
// a warm build: reads the artifact header, re-derives the same hash, and exits without ever requiring
// ts-morph. `--print-model` forces a fresh (cold) run and prints the completeness table used by AC1.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const model = require('./stateSerializerModel');

const REPO_ROOT = path.join(__dirname, '..');
const ARTIFACT_REL = 'server/game/core/generated/GeneratedStateSerializers.ts';
const GENERATOR_SOURCE_FILES = [
    'scripts/stateSerializerModel.js',
    'scripts/stateSerializerGenerator.js',
    'scripts/generate-state-serializers.js',
];
const TSCONFIG_FILE = 'tsconfig.json';

function readArtifactHeader() {
    const abs = path.join(REPO_ROOT, ARTIFACT_REL);
    if (!fs.existsSync(abs)) {
        return null;
    }
    return model.readArtifactCacheHeader(fs.readFileSync(abs, 'utf8'));
}

function assertTsMorphNotLoaded() {
    const loadedTsMorph = Object.keys(require.cache)
        .some((key) => (/[\\/]ts-morph[\\/]/).test(key));
    if (loadedTsMorph) {
        throw new Error('Generation cache reported a hit but ts-morph is already in require.cache - the warm path must never load it.');
    }
}

function main() {
    const forceRegenerate = process.argv.includes('--print-model');
    const t0 = Date.now();

    const candidates = model.collectCandidateFiles(REPO_ROOT);
    const previousHeader = readArtifactHeader();
    const previousVisited = previousHeader ? previousHeader.visitedFiles : [];

    const gateInputs = Array.from(new Set([...candidates, ...previousVisited, ...GENERATOR_SOURCE_FILES, TSCONFIG_FILE]));
    const gateHash = model.computeGenerationHash(REPO_ROOT, gateInputs, [model.STATE_RECORD_FORMAT_VERSION]);
    const isCacheHit = !forceRegenerate && previousHeader !== null && gateHash !== null && gateHash === previousHeader.generationHash;

    if (isCacheHit) {
        assertTsMorphNotLoaded();
        console.log(`[generate-state-serializers] cache hit (${gateHash.slice(0, 12)}...); ts-morph not loaded. warm gate: ${Date.now() - t0}ms`);
        return;
    }

    // eslint-disable-next-line global-require
    const { Node, Project, SyntaxKind } = require('ts-morph');
    // eslint-disable-next-line global-require
    const generator = require('./stateSerializerGenerator');

    const tResolveStart = Date.now();
    const { targets, visitedFiles } = generator.resolveGenerator({ Node, Project, SyntaxKind }, REPO_ROOT, path.join(REPO_ROOT, TSCONFIG_FILE));
    const tResolveEnd = Date.now();

    const finalInputs = Array.from(new Set([...candidates, ...visitedFiles, ...GENERATOR_SOURCE_FILES, TSCONFIG_FILE]));
    const finalHash = model.computeGenerationHash(REPO_ROOT, finalInputs, [model.STATE_RECORD_FORMAT_VERSION]);
    if (finalHash === null) {
        throw new Error('Could not recompute the generation hash after a successful resolve - a candidate or visited file disappeared mid-run.');
    }

    const artifactText = generator.emitArtifact({ targets, generationHash: finalHash, visitedFiles });

    const artifactAbs = path.join(REPO_ROOT, ARTIFACT_REL);
    fs.mkdirSync(path.dirname(artifactAbs), { recursive: true });
    const tmpAbs = `${artifactAbs}.tmp${process.pid}`;
    fs.writeFileSync(tmpAbs, artifactText, 'utf8');
    fs.renameSync(tmpAbs, artifactAbs);

    const emptyFieldTargets = targets.filter((t) => t.fields.length === 0)
        .map((t) => t.name);
    console.log(`[generate-state-serializers] generated ${targets.length} serializer targets, 0 resolve errors, ${emptyFieldTargets.length} with an empty field set. resolve: ${tResolveEnd - tResolveStart}ms, total: ${Date.now() - t0}ms`);
    if (emptyFieldTargets.length > 0) {
        console.log(`[generate-state-serializers] targets with an empty field set: ${emptyFieldTargets.join(', ')}`);
    }

    if (forceRegenerate) {
        const table = generator.renderCompletenessTable(targets);
        const sha256 = crypto.createHash('sha256')
            .update(table)
            .digest('hex');
        console.log('--- TARGET COMPLETENESS TABLE (name|decorator|abstract|fieldCount|field:kind,...) ---');
        console.log(table);
        console.log('--- TABLE SHA256 ---', sha256);
    }
}

main();
