// ts-morph-backed resolver + emitter for the codegen state serializers (Plan 3, Phase A step 1). Only
// `require`d on a generation-cache miss (see generate-state-serializers.js), so a warm build never pays
// ts-morph's load cost. Ports the mixin-chain resolution approach measured during planning
// (.anvil/p3-pa1/experiments/mixin-resolution-pilot.js) against the live repo.

const model = require('./stateSerializerModel');

function resolveGenerator({ Node, Project, SyntaxKind }, repoRoot, tsConfigFilePath) {
    const visited = new Set();

    function relPath(sourceFile) {
        return model.toPosixRelative(repoRoot, sourceFile.getFilePath());
    }

    function loc(node) {
        const sf = node.getSourceFile();
        return `${relPath(sf)}#L${sf.getLineAndColumnAtPos(node.getStart()).line}`;
    }

    function note(node) {
        visited.add(relPath(node.getSourceFile()));
    }

    function hasRegisterDecorator(classDecl) {
        return classDecl.getDecorators()
            .some((d) => model.REGISTER_DECORATOR_NAMES.has(d.getName()));
    }

    function decoratorKindOf(classDecl) {
        return classDecl.getDecorators()
            .some((d) => d.getName() === 'registerState') ? 'registerState' : 'registerStateBase';
    }

    function ownFields(classDecl) {
        const out = [];
        for (const prop of classDecl.getProperties()) {
            if (!prop.hasAccessorKeyword()) {
                continue;
            }
            const decorator = prop.getDecorators()
                .find((d) => model.FIELD_DECORATOR_TO_KIND.has(d.getName()));
            if (!decorator) {
                continue;
            }
            out.push({ name: prop.getName(), kind: model.FIELD_DECORATOR_TO_KIND.get(decorator.getName()), src: loc(prop) });
        }
        return out;
    }

    function unwrap(expr) {
        let current = expr;
        while (Node.isParenthesizedExpression(current) || Node.isAsExpression(current) || Node.isTypeAssertion(current) || Node.isSatisfiesExpression(current) || Node.isNonNullExpression(current)) {
            current = current.getExpression();
        }
        return current;
    }

    function resolveFromExpression(expr, ctx) {
        const e = unwrap(expr);
        if (Node.isIdentifier(e)) {
            if (ctx && e.getText() === ctx.baseParam) {
                return ctx.baseArg ? resolveFromExpression(ctx.baseArg, ctx.parent) : null;
            }
            const def = e.getDefinitions()[0] && e.getDefinitions()[0].getDeclarationNode();
            if (def && Node.isVariableDeclaration(def)) {
                note(def);
                return resolveFromExpression(def.getInitializer(), ctx);
            }
            const sym = e.getSymbol() && (e.getSymbol().getAliasedSymbol() || e.getSymbol());
            const classDecl = sym && sym.getDeclarations()
                .find(Node.isClassDeclaration);
            if (classDecl) {
                note(classDecl);
                return resolveClass(classDecl, ctx);
            }
            throw new Error(`Unresolvable extends-clause identifier "${e.getText()}" at ${loc(e)}. The generator only follows a class, or a variable alias holding a class or mixin call.`);
        }
        if (Node.isCallExpression(e)) {
            return resolveFromCall(e, ctx);
        }
        throw new Error(`Unsupported extends-clause expression "${e.getText()}" at ${loc(e)}.`);
    }

    function resolveFromCall(call, outerCtx) {
        const target = unwrap(call.getExpression());
        const sym = target.getSymbol() && (target.getSymbol().getAliasedSymbol() || target.getSymbol());
        const fn = sym && sym.getDeclarations()
            .find(Node.isFunctionDeclaration);
        if (!fn) {
            throw new Error(`Unresolvable mixin factory "${target.getText()}" at ${loc(call)}. Only a resolvable function declaration is supported.`);
        }
        note(fn);
        const ctx = {
            fn,
            name: target.getText(),
            baseParam: fn.getParameters()[0].getName(),
            baseArg: call.getArguments()[0],
            parent: outerCtx,
        };
        const body = fn.getBody();
        for (const ret of body.getStatements()
            .filter(Node.isReturnStatement)) {
            const e = unwrap(ret.getExpression());
            if (Node.isIdentifier(e)) {
                const def = e.getDefinitions()[0] && e.getDefinitions()[0].getDeclarationNode();
                if (def && Node.isClassDeclaration(def)) {
                    note(def);
                    return resolveClass(def, ctx);
                }
                if (def && Node.isVariableDeclaration(def)) {
                    note(def);
                    return resolveFromExpression(def.getInitializer(), ctx);
                }
            }
            if (Node.isCallExpression(e)) {
                return resolveFromExpression(e, ctx);
            }
        }
        throw new Error(`Could not resolve the class returned by mixin "${ctx.name}" at ${loc(fn)}.`);
    }

    function resolveClass(classDecl, ctx) {
        note(classDecl);
        const ext = classDecl.getExtends();
        const parent = ext ? resolveFromExpression(ext.getExpression(), ctx) : null;
        return { name: classDecl.getName(), fields: ownFields(classDecl), parent, file: loc(classDecl) };
    }

    function flatten(node, targetName) {
        const chain = [];
        let n = node;
        while (n) {
            chain.unshift(n);
            n = n.parent;
        }
        const seen = new Map();
        const fields = [];
        for (const c of chain) {
            for (const f of c.fields) {
                if (seen.has(f.name)) {
                    throw new Error(`Duplicate flattened field "${f.name}" resolving "${targetName}": declared at both ${seen.get(f.name).src} and ${f.src}.`);
                }
                seen.set(f.name, f);
                fields.push({ owner: c.name, ...f });
            }
        }
        return { chain: chain.map((c) => c.name), fields };
    }

    const project = new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: false });
    const sourceFiles = project.getSourceFiles();

    const rawClasses = [];
    for (const sf of sourceFiles) {
        for (const classDecl of sf.getDescendantsOfKind(SyntaxKind.ClassDeclaration)) {
            if (!hasRegisterDecorator(classDecl)) {
                continue;
            }
            rawClasses.push({
                name: classDecl.getName(),
                decorator: decoratorKindOf(classDecl),
                isAbstract: classDecl.isAbstract(),
                isExported: classDecl.isExported(),
                declaredInFunction: classDecl.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) != null,
                file: loc(classDecl),
                classDecl,
            });
        }
    }

    const targets = model.selectTargets(rawClasses);
    model.assertModelIsGeneratable(targets);

    const resolved = targets.map((target) => {
        const chainRoot = resolveClass(target.classDecl, null);
        const { fields } = flatten(chainRoot, target.name);
        return {
            name: target.name,
            decorator: target.decorator,
            isAbstract: target.isAbstract,
            fields: fields.map((f) => ({ name: f.name, kind: f.kind })),
        };
    });

    // P3-PA4: classes registered at runtime but deliberately excluded from `targets` above by
    // `selectTargets`'s `declaredInFunction` filter (mixin-fragment classes declared inside factory
    // function bodies, e.g. WithCost/WithDamage). Sourced from `rawClasses`, which already carries this -
    // nothing new is resolved here, only reported, so StateSerializerCoverageCheck.ts's reverse pass can
    // tell "known fragment" apart from "stale/missing generator target".
    const excludedFragmentClassNames = rawClasses
        .filter((rawClass) => rawClass.declaredInFunction)
        .map((rawClass) => rawClass.name)
        .sort();

    return {
        targets: resolved,
        visitedFiles: Array.from(visited)
            .sort(),
        excludedFragmentClassNames,
    };
}

function fieldEncodeExpr(kind, target, field) {
    const accessor = `i.${field.name}`;
    switch (kind) {
        case 'primitive': return accessor;
        case 'value': return `encodeStateValue('${target}.${field.name}', ${accessor})`;
        case 'ref': return `encodeRef(${accessor})`;
        case 'refArray': return `encodeRefArray(${accessor})`;
        case 'refMap': return `encodeRefMap(${accessor})`;
        case 'refSet': return `encodeRefSet(${accessor})`;
        case 'refRecord': return `encodeRefRecord(${accessor})`;
        default: throw new Error(`Unknown field kind "${kind}"`);
    }
}

function fieldDecodeExpr(kind, field) {
    const raw = `r.${field.name}`;
    switch (kind) {
        case 'primitive': return raw;
        case 'value': return `decodeStateValue(${raw})`;
        case 'ref': return `decodeRef(game, ${raw})`;
        case 'refArray': return `decodeRefArray(game, ${raw})`;
        case 'refRecord': return `decodeRefRecord(game, ${raw})`;
        default: throw new Error(`Unknown field kind "${kind}" for a single-expression assignment`);
    }
}

// refMap/refSet need more than a single assignment. GameObjectUtils.ts's UndoMap/UndoSet (backing
// @stateRefMap/@stateRefSet) override set()/add() to also write the id into the state bag, and that
// override reads a private field that is not yet initialized while the Map/Set base constructor is still
// running (`super(entries)` invokes the overridden set()/add() for each initial entry before the
// subclass's own field initializers run) - so constructing one pre-populated throws
// "Cannot read private member from an object whose class did not declare it". The engine's own rollback
// hydration path (`hydrateUndoMapFromIds`/`hydrateUndoSetFromIds` in GameObjectUtils.ts) avoids this by
// building empty and populating through `Map.prototype.set.call`/`Set.prototype.add.call` after
// construction. This can't reuse that helper (it isn't exported and this file may not import
// GameObjectUtils.ts), so it reproduces the same shape at the call site: assign an empty collection
// through the public accessor (safe - no entries reach the constructor), then populate it via the live
// object's own overridden set()/add(), which is the documented in-place-mutation idiom and safe once the
// object is fully constructed.
function fieldDecodeStatements(kind, field) {
    const raw = `r.${field.name}`;
    if (kind === 'refMap') {
        const decodedVar = `decoded${field.name.replace(/^_/, '')}`;
        return [
            `    const ${decodedVar} = decodeRefMap(game, ${raw});`,
            `    if (${decodedVar} === null) {`,
            `        i.${field.name} = null;`,
            '    } else {',
            `        i.${field.name} = new Map();`,
            `        for (const [decodedKey, decodedValue] of ${decodedVar}) {`,
            `            i.${field.name}.set(decodedKey, decodedValue);`,
            '        }',
            '    }',
        ];
    }
    if (kind === 'refSet') {
        const decodedVar = `decoded${field.name.replace(/^_/, '')}`;
        return [
            `    const ${decodedVar} = decodeRefSet(game, ${raw});`,
            `    if (${decodedVar} === null) {`,
            `        i.${field.name} = null;`,
            '    } else {',
            `        i.${field.name} = new Set();`,
            `        for (const decodedValue of ${decodedVar}) {`,
            `            i.${field.name}.add(decodedValue);`,
            '        }',
            '    }',
        ];
    }
    return [`    i.${field.name} = ${fieldDecodeExpr(kind, field)};`];
}

function fieldInterfaceType(kind) {
    switch (kind) {
        case 'primitive': return 'SerializedPrimitive';
        case 'value': return 'unknown';
        case 'ref': return 'string | null';
        case 'refArray': return 'string[] | null';
        case 'refMap': return '{ $map: [string, unknown][] } | null';
        case 'refSet': return '{ $set: unknown[] } | null';
        case 'refRecord': return 'Record<string, string> | null';
        default: throw new Error(`Unknown field kind "${kind}"`);
    }
}

// Builds the completeness table used by --print-model / AC1: one sorted line per target,
// "name|decorator|abstract|fieldCount|field:kind,...", fields in base-to-derived flatten order.
function renderCompletenessTable(targets) {
    return targets
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => `${t.name}|${t.decorator}|${t.isAbstract ? 'abstract' : 'concrete'}|${t.fields.length}|${t.fields.map((f) => `${f.name}:${f.kind}`).join(',')}`)
        .join('\n');
}

function emitArtifact({ targets, generationHash, visitedFiles, excludedFragmentClassNames }) {
    const usedKinds = new Set();
    for (const target of targets) {
        for (const field of target.fields) {
            usedKinds.add(field.kind);
        }
    }

    const encodeFns = [];
    const decodeFns = [];
    if (usedKinds.has('value')) {
        encodeFns.push('encodeStateValue');
        decodeFns.push('decodeStateValue');
    }
    for (const kind of ['ref', 'refArray', 'refMap', 'refSet', 'refRecord']) {
        if (usedKinds.has(kind)) {
            encodeFns.push(`encode${kind[0].toUpperCase()}${kind.slice(1)}`);
            decodeFns.push(`decode${kind[0].toUpperCase()}${kind.slice(1)}`);
        }
    }
    const runtimeImports = [...encodeFns, ...decodeFns];

    const typeImports = ['SerializedStateRecord', 'IGeneratedSerializerEntry'];
    if (usedKinds.has('primitive')) {
        typeImports.push('SerializedPrimitive');
    }

    const schemaSurfaceHash = model.computeSchemaSurfaceHash(targets, model.STATE_ENCODING_TAGS, model.STATE_RECORD_FORMAT_VERSION);

    const interfaceBlocks = targets.map((target) => {
        const members = target.fields.map((field) => `    ${field.name}: ${fieldInterfaceType(field.kind)};`).join('\n');
        return `export interface ISerialized${target.name} {\n${members}\n}`;
    });

    const fnBlocks = targets.map((target) => {
        const serializeAssigns = target.fields.map((field) => `        ${field.name}: ${fieldEncodeExpr(field.kind, target.name, field)},`).join('\n');
        const deserializeAssigns = target.fields.flatMap((field) => fieldDecodeStatements(field.kind, field)).join('\n');
        return [
            `function serialize${target.name}(instance: IGameObjectBase): SerializedStateRecord {`,
            '    const i = instance as any;',
            '    return {',
            serializeAssigns,
            '    };',
            '}',
            '',
            `function deserialize${target.name}(game: Game, instance: IGameObjectBase, record: SerializedStateRecord): void {`,
            '    const i = instance as any;',
            `    const r = record as unknown as ISerialized${target.name};`,
            deserializeAssigns,
            '}',
        ].join('\n');
    });

    const entryLines = targets
        .map((target) => {
            const fieldsLiteral = target.fields
                .map((field) => `{ name: '${field.name}', kind: '${field.kind}' }`)
                .join(', ');
            return `    { className: '${target.name}', decorator: '${target.decorator}', isAbstract: ${target.isAbstract}, fields: [${fieldsLiteral}], serializer: { serialize: serialize${target.name}, deserialize: deserialize${target.name} } },`;
        })
        .join('\n');

    const excludedFragmentClassNamesLiteral = (excludedFragmentClassNames ?? [])
        .map((name) => `'${name}'`)
        .join(', ');

    const header = model.renderArtifactCacheHeader({
        formatVersion: model.STATE_RECORD_FORMAT_VERSION,
        generationHash,
        visitedFiles,
    });

    return [
        header,
        '// AUTO-GENERATED by scripts/generate-state-serializers.js (Plan 3, Phase A step 1). Do not edit by',
        '// hand; run `npm run generate-serializers` or a full build, both of which regenerate on any input',
        '// change. This artifact is gitignored (server/game/core/generated/) and not on any engine path yet.',
        '',
        'import type { Game } from \'../Game\';',
        'import type { IGameObjectBase } from \'../GameObjectBase\';',
        runtimeImports.length > 0 ? `import { ${runtimeImports.join(', ')} } from '../StateEncoding';` : '',
        `import type { ${typeImports.join(', ')} } from '../StateEncoding';`,
        '',
        interfaceBlocks.join('\n\n'),
        '',
        fnBlocks.join('\n\n'),
        '',
        'export const generatedStateSerializerEntries: readonly IGeneratedSerializerEntry[] = [',
        entryLines,
        '];',
        '',
        `export const generatedExcludedFragmentClassNames: readonly string[] = [${excludedFragmentClassNamesLiteral}];`,
        '',
        `export const GENERATED_SCHEMA_SURFACE_HASH = '${schemaSurfaceHash}';`,
        `export const GENERATED_SCHEMA_FORMAT_VERSION = ${model.STATE_RECORD_FORMAT_VERSION};`,
        '',
    ].filter((line) => line !== undefined)
        .join('\n');
}

module.exports = {
    resolveGenerator,
    renderCompletenessTable,
    emitArtifact,
};
