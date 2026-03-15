const fs = require('fs');
const path = require('path');
const { Project, Node, SyntaxKind } = require('ts-morph');

const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'server', 'game', 'core', 'stateSerialization', 'GeneratedStateSerializers.ts');

const project = new Project({
    tsConfigFilePath: path.join(repoRoot, 'tsconfig.json')
});

const supportedFieldDecorators = new Set(['statePrimitive', 'stateValue', 'stateRef', 'stateRefArray', 'stateRefMap', 'stateRefSet', 'stateRefRecord']);
const supportedClassDecorators = new Set(['registerState', 'registerStateBase']);

const diagnostics = [];
const entries = [];
const entriesByName = new Map();

for (const sourceFile of project.getSourceFiles('server/**/*.ts')) {
    for (const classDeclaration of sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration)) {
        const classDecorator = findSupportedDecorator(classDeclaration, supportedClassDecorators);
        if (!classDecorator) {
            continue;
        }

        const className = classDeclaration.getName();
        if (!className) {
            diagnostics.push(`Anonymous registerState class in ${relativePath(sourceFile.getFilePath())}`);
            continue;
        }

        if (entriesByName.has(className)) {
            const existing = entriesByName.get(className);
            diagnostics.push(`Duplicate registerState class name "${className}" in ${relativePath(sourceFile.getFilePath())} and ${existing.sourcePath}`);
            continue;
        }

        const fields = [];

        for (const member of classDeclaration.getMembers()) {
            if (typeof member.getDecorators !== 'function') {
                continue;
            }

            const fieldDecorator = findSupportedDecorator(member, supportedFieldDecorators);
            if (!fieldDecorator) {
                continue;
            }

            if (!Node.isPropertyDeclaration(member) && member.getKindName() !== 'Accessor') {
                diagnostics.push(`Unsupported decorated member kind for ${className}.${member.getName()} in ${relativePath(sourceFile.getFilePath())}`);
                continue;
            }

            const memberName = member.getName();
            if (!memberName) {
                diagnostics.push(`Unsupported computed state member in ${className} (${relativePath(sourceFile.getFilePath())})`);
                continue;
            }

            const fieldDescriptor = buildFieldDescriptor(fieldDecorator, memberName, className, sourceFile.getFilePath());
            if (fieldDescriptor) {
                fields.push(fieldDescriptor);
            }
        }

        const entry = {
            className,
            copyMode: resolveEffectiveCopyMode(classDeclaration),
            sourcePath: relativePath(sourceFile.getFilePath()),
            fields
        };

        entries.push(entry);
        entriesByName.set(className, entry);
    }
}

if (diagnostics.length > 0) {
    throw new Error(`State serializer generation failed:\n- ${diagnostics.join('\n- ')}`);
}

entries.sort((left, right) => {
    const pathCompare = left.sourcePath.localeCompare(right.sourcePath);
    if (pathCompare !== 0) {
        return pathCompare;
    }

    return left.className.localeCompare(right.className);
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, renderOutput(entries));

function renderOutput(serializedEntries) {
    return `import type { GeneratedStateClassEntry } from './StateSerializationTypes';

export const generatedStateClassEntries: GeneratedStateClassEntry[] = ${JSON.stringify(serializedEntries, null, 4)};
`;
}

function findSupportedDecorator(node, supportedNames) {
    return node.getDecorators().find((decorator) => supportedNames.has(getDecoratorName(decorator)));
}

function getDecoratorName(decorator) {
    const expression = decorator.getExpression();
    if (Node.isCallExpression(expression)) {
        return expression.getExpression().getText();
    }

    return expression.getText();
}

function getDecoratorArguments(decorator) {
    const expression = decorator.getExpression();
    return Node.isCallExpression(expression) ? expression.getArguments() : [];
}

function buildFieldDescriptor(decorator, memberName, className, filePath) {
    const decoratorName = getDecoratorName(decorator);

    switch (decoratorName) {
        case 'statePrimitive':
            return { name: memberName, kind: 'primitive' };
        case 'stateValue':
            return { name: memberName, kind: 'value' };
        case 'stateRef':
            return { name: memberName, kind: 'ref' };
        case 'stateRefMap':
            return { name: memberName, kind: 'refMap' };
        case 'stateRefSet':
            return { name: memberName, kind: 'refSet' };
        case 'stateRefRecord':
            return { name: memberName, kind: 'refRecord' };
        case 'stateRefArray': {
            const args = getDecoratorArguments(decorator);
            if (args.length > 1) {
                diagnostics.push(`Unsupported stateRefArray arguments for ${className}.${memberName} in ${relativePath(filePath)}`);
                return null;
            }

            let readonlyArray = true;
            if (args.length === 1) {
                const argumentText = args[0].getText().trim();
                if (argumentText === 'true') {
                    readonlyArray = true;
                } else if (argumentText === 'false') {
                    readonlyArray = false;
                } else {
                    diagnostics.push(`stateRefArray requires a boolean literal for ${className}.${memberName} in ${relativePath(filePath)}`);
                    return null;
                }
            }

            return { name: memberName, kind: 'refArray', readonlyArray };
        }
        default:
            diagnostics.push(`Unsupported state field decorator ${decoratorName} for ${className}.${memberName} in ${relativePath(filePath)}`);
            return null;
    }
}

function resolveEffectiveCopyMode(classDeclaration) {
    const ownCopyMode = getOwnCopyMode(classDeclaration);
    if (ownCopyMode === 'Runtime') {
        return 'Runtime';
    }

    const baseClass = classDeclaration.getBaseClass();
    if (!baseClass) {
        return ownCopyMode;
    }

    if (resolveEffectiveCopyMode(baseClass) === 'Runtime') {
        return 'Runtime';
    }

    return ownCopyMode;
}

function getOwnCopyMode(classDeclaration) {
    const decorator = findSupportedDecorator(classDeclaration, supportedClassDecorators);
    if (!decorator) {
        return 'CompileTime';
    }

    const args = getDecoratorArguments(decorator);
    if (args.length === 0) {
        return 'CompileTime';
    }

    const firstArg = args[0].getText().trim();
    if (firstArg === 'CopyMode.Runtime' || firstArg === 'CopyMode.UseBulkCopy') {
        return 'Runtime';
    }

    if (firstArg === 'CopyMode.CompileTime' || firstArg === 'CopyMode.UseMetaDataOnly') {
        return 'CompileTime';
    }

    if (firstArg.startsWith('{')) {
        if (/copyMode\s*:\s*CopyMode\.(Runtime|UseBulkCopy)/.test(firstArg)) {
            return 'Runtime';
        }

        return 'CompileTime';
    }

    diagnostics.push(`Unsupported copyMode argument "${firstArg}" for ${classDeclaration.getName() ?? '<anonymous>'} in ${relativePath(classDeclaration.getSourceFile().getFilePath())}`);
    return 'CompileTime';
}

function relativePath(filePath) {
    return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}