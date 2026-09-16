import fs from 'fs';
import os from 'os';
import path from 'path';

import * as model from '../../../scripts/stateSerializerModel';

/**
 * Pure-function coverage of scripts/stateSerializerModel.js (Plan 3, Phase A step 1) over temporary fixture
 * directories, so the cache/hash/validation rules are exercised without paying ts-morph's load cost. The
 * generator's own real-tree behavior (ts-morph resolution, --print-model) is covered by
 * GeneratedStateSerializers.spec.ts and the recorded manual experiment in .anvil/p3-pa1/experiments/,
 * not here.
 */
describe('stateSerializerModel', function() {
    let repoRoot: string;

    beforeEach(function() {
        repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-p3pa1-model-'));
        fs.mkdirSync(path.join(repoRoot, 'server'), { recursive: true });
        fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
    });

    afterEach(function() {
        fs.rmSync(repoRoot, { recursive: true, force: true });
    });

    function write(relPath: string, content: string) {
        const abs = path.join(repoRoot, relPath);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, content, 'utf8');
    }

    describe('collectCandidateFiles / computeGenerationHash', function() {
        it('produces an identical hash for an unchanged candidate set, visited list, generator sources, and tsconfig', function() {
            write('server/A.ts', '@registerState()\nclass A {}\n');
            write('scripts/gen1.js', 'module.exports = 1;');
            write('tsconfig.json', '{}');

            const inputs = ['server/A.ts', 'scripts/gen1.js', 'tsconfig.json'];
            const hash1 = model.computeGenerationHash(repoRoot, inputs);
            const hash2 = model.computeGenerationHash(repoRoot, inputs);

            expect(hash1).not.toBeNull();
            expect(hash1).toEqual(hash2);
        });

        it('cache miss via the visited list: editing a file with no decorator name changes the hash only when that file is in the visited list (paired control)', function() {
            write('scripts/gen1.js', 'module.exports = 1;');
            write('server/NoDecorator.ts', 'export const x = 1;');

            const withoutVisited = model.computeGenerationHash(repoRoot, ['scripts/gen1.js']);
            write('server/NoDecorator.ts', 'export const x = 2;');
            const withoutVisitedAfterEdit = model.computeGenerationHash(repoRoot, ['scripts/gen1.js']);
            expect(withoutVisitedAfterEdit).toEqual(withoutVisited);

            const withVisited = model.computeGenerationHash(repoRoot, ['scripts/gen1.js', 'server/NoDecorator.ts']);
            write('server/NoDecorator.ts', 'export const x = 3;');
            const withVisitedAfterEdit = model.computeGenerationHash(repoRoot, ['scripts/gen1.js', 'server/NoDecorator.ts']);
            expect(withVisitedAfterEdit).not.toEqual(withVisited);
        });

        it('cache miss when a new decorator-name candidate file appears', function() {
            const before = model.collectCandidateFiles(repoRoot);
            write('server/B.ts', '@stateRef() accessor b;');
            const after = model.collectCandidateFiles(repoRoot);

            expect(after.length).toBeGreaterThan(before.length);
            expect(after).toContain('server/B.ts');
        });

        it('cache miss when a generator source file changes', function() {
            write('scripts/gen1.js', 'module.exports = 1;');
            const inputs = ['scripts/gen1.js'];
            const before = model.computeGenerationHash(repoRoot, inputs);

            write('scripts/gen1.js', 'module.exports = 2;');
            const after = model.computeGenerationHash(repoRoot, inputs);

            expect(after).not.toEqual(before);
        });

        it('cache miss when tsconfig.json changes', function() {
            write('tsconfig.json', '{"a":1}');
            const inputs = ['tsconfig.json'];
            const before = model.computeGenerationHash(repoRoot, inputs);

            write('tsconfig.json', '{"a":2}');
            const after = model.computeGenerationHash(repoRoot, inputs);

            expect(after).not.toEqual(before);
        });

        it('a previously-visited file that no longer exists yields a miss (null), not a thrown ENOENT', function() {
            write('server/Gone.ts', 'x');
            const inputs = ['server/Gone.ts'];
            fs.rmSync(path.join(repoRoot, 'server/Gone.ts'));

            expect(() => model.computeGenerationHash(repoRoot, inputs)).not.toThrow();
            expect(model.computeGenerationHash(repoRoot, inputs)).toBeNull();
        });

        it('hashes are path-separator independent: backslash-spelled and forward-slash-spelled inputs for the same files hash identically', function() {
            write('server/nested/Deep.ts', 'x');
            const forward = model.computeGenerationHash(repoRoot, ['server/nested/Deep.ts']);
            const backslash = model.computeGenerationHash(repoRoot, ['server\\nested\\Deep.ts']);

            expect(forward).not.toBeNull();
            expect(forward).toEqual(backslash);
        });
    });

    describe('artifact cache header', function() {
        it('renders and parses a round trip, with visitedFiles forward-slash normalized and sorted', function() {
            const rendered = model.renderArtifactCacheHeader({
                formatVersion: 1,
                generationHash: 'deadbeef',
                visitedFiles: ['server/b.ts', 'server/a.ts']
            });

            const parsed = model.readArtifactCacheHeader(rendered);
            expect(parsed).not.toBeNull();
            expect(parsed.formatVersion).toBe(1);
            expect(parsed.generationHash).toBe('deadbeef');
            expect(parsed.visitedFiles).toEqual(['server/a.ts', 'server/b.ts']);
        });

        it('treats a missing header as cold (null), not a hit', function() {
            expect(model.readArtifactCacheHeader('// no header here\nexport const x = 1;\n')).toBeNull();
        });

        it('treats an unparseable (truncated) header as cold (null)', function() {
            const truncated = '/* generation-cache-begin\n{"formatVersion":1,"generat';
            expect(model.readArtifactCacheHeader(truncated)).toBeNull();
        });
    });

    describe('computeSchemaSurfaceHash', function() {
        const tags = ['$map', '$set', '$num'];
        const baseModel = [
            { name: 'Alpha', fields: [{ name: 'a', kind: 'primitive' }, { name: 'b', kind: 'ref' }] },
            { name: 'Beta', fields: [{ name: 'c', kind: 'value' }] }
        ];

        it('is unchanged by reordering fields within a class', function() {
            const reordered = [
                { name: 'Alpha', fields: [{ name: 'b', kind: 'ref' }, { name: 'a', kind: 'primitive' }] },
                { name: 'Beta', fields: [{ name: 'c', kind: 'value' }] }
            ];
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).toEqual(model.computeSchemaSurfaceHash(reordered, tags, 1));
        });

        it('is unchanged by reordering classes', function() {
            const reordered = [baseModel[1], baseModel[0]];
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).toEqual(model.computeSchemaSurfaceHash(reordered, tags, 1));
        });

        it('is unchanged by flipping a target\'s isAbstract/decorator kind, since those fields are not hash inputs', function() {
            const withMeta = baseModel.map((t) => ({ ...t, isAbstract: true, decorator: 'registerState' }));
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).toEqual(model.computeSchemaSurfaceHash(withMeta, tags, 1));
        });

        it('changes when a field is renamed', function() {
            const renamed = [
                { name: 'Alpha', fields: [{ name: 'a2', kind: 'primitive' }, { name: 'b', kind: 'ref' }] },
                { name: 'Beta', fields: [{ name: 'c', kind: 'value' }] }
            ];
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash(renamed, tags, 1));
        });

        it('changes when a field\'s kind changes', function() {
            const rekinded = [
                { name: 'Alpha', fields: [{ name: 'a', kind: 'value' }, { name: 'b', kind: 'ref' }] },
                { name: 'Beta', fields: [{ name: 'c', kind: 'value' }] }
            ];
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash(rekinded, tags, 1));
        });

        it('changes when a class is added or removed', function() {
            const withExtra = [...baseModel, { name: 'Gamma', fields: [] }];
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash(withExtra, tags, 1));
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash([baseModel[0]], tags, 1));
        });

        it('changes when a tag is added to the vocabulary', function() {
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash(baseModel, [...tags, '$newTag'], 1));
        });

        it('changes when the format version is bumped', function() {
            expect(model.computeSchemaSurfaceHash(baseModel, tags, 1)).not.toEqual(model.computeSchemaSurfaceHash(baseModel, tags, 2));
        });
    });

    describe('selectTargets', function() {
        it('excludes function-body-declared classes and keeps top-level ones', function() {
            const rawClasses = [
                { name: 'TopLevel', declaredInFunction: false },
                { name: 'MixinFragment', declaredInFunction: true }
            ];
            const targets = model.selectTargets(rawClasses);

            expect(targets.map((t) => t.name)).toEqual(['TopLevel']);
        });
    });

    describe('assertModelIsGeneratable', function() {
        it('throws on a duplicate target name, even when the flattened field sets are identical', function() {
            const targets = [
                { name: 'Dup', decorator: 'registerState', isAbstract: false, isExported: true, file: 'a.ts#L1' },
                { name: 'Dup', decorator: 'registerState', isAbstract: false, isExported: true, file: 'b.ts#L1' }
            ];
            expect(() => model.assertModelIsGeneratable(targets)).toThrowError(/Dup/);
        });

        it('throws on a module-local non-abstract @registerState class', function() {
            const targets = [
                { name: 'Local', decorator: 'registerState', isAbstract: false, isExported: false, file: 'a.ts#L1' }
            ];
            expect(() => model.assertModelIsGeneratable(targets)).toThrowError(/Local/);
        });

        it('throws on a module-local non-abstract @registerStateBase class', function() {
            const targets = [
                { name: 'LocalBase', decorator: 'registerStateBase', isAbstract: false, isExported: false, file: 'a.ts#L1' }
            ];
            expect(() => model.assertModelIsGeneratable(targets)).toThrowError(/LocalBase/);
        });

        it('accepts export default class (isExported true) for either decorator', function() {
            const targets = [
                { name: 'DefaultExported', decorator: 'registerState', isAbstract: false, isExported: true, file: 'a.ts#L1' }
            ];
            expect(() => model.assertModelIsGeneratable(targets)).not.toThrow();
        });

        it('accepts a module-local abstract class', function() {
            const targets = [
                { name: 'LocalAbstract', decorator: 'registerStateBase', isAbstract: true, isExported: false, file: 'a.ts#L1' }
            ];
            expect(() => model.assertModelIsGeneratable(targets)).not.toThrow();
        });
    });
});
