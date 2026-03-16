import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import {
    type ClassDeclaration,
    Project,
    SyntaxKind
} from 'ts-morph';

type StateDecoratorKind = 'primitive' | 'value' | 'ref' | 'refArray' | 'refMap' | 'refSet' | 'refRecord';

interface IStateField {
    name: string;
    kind: StateDecoratorKind;
}

interface IRegisteredClassInfo {
    className: string;
    fields: IStateField[];
}

const GENERATED_FILE_PATH = 'server/game/core/generated/GeneratedStateSerializers.ts';
const REGISTER_CLASS_DECORATORS = new Set(['registerState', 'registerStateBase']);
const STATE_FIELD_DECORATORS = new Map<string, StateDecoratorKind>([
    ['statePrimitive', 'primitive'],
    ['stateValue', 'value'],
    ['stateRef', 'ref'],
    ['stateRefArray', 'refArray'],
    ['stateRefMap', 'refMap'],
    ['stateRefSet', 'refSet'],
    ['stateRefRecord', 'refRecord']
]);

function main() {
    const project = new Project({
        tsConfigFilePath: 'tsconfig.json',
        skipAddingFilesFromTsConfig: false,
    });

    const registeredClasses = collectRegisteredClasses(project);
    const fileContents = buildGeneratedFile(registeredClasses);
    writeGeneratedFile(fileContents);
}

function collectRegisteredClasses(project: Project): IRegisteredClassInfo[] {
    const decoratedClasses = new Map<string, ClassDeclaration>();

    for (const sourceFile of project.getSourceFiles('server/**/*.ts')) {
        if (sourceFile.getFilePath().endsWith(GENERATED_FILE_PATH.split('/').join('\\'))) {
            continue;
        }

        for (const classDeclaration of sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration)) {
            if (!hasRegisterStateDecorator(classDeclaration)) {
                continue;
            }

            const className = classDeclaration.getName();
            if (!className) {
                throw new Error(`Encountered an anonymous @registerState class in ${sourceFile.getFilePath()}`);
            }
            if (decoratedClasses.has(className)) {
                throw new Error(
                    `Duplicate @registerState class name "${className}" found in ${sourceFile.getFilePath()} and ${decoratedClasses.get(className)?.getSourceFile()
                        .getFilePath()}`
                );
            }

            decoratedClasses.set(className, classDeclaration);
        }
    }

    return Array.from(decoratedClasses.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([className, classDeclaration]) => ({
            className,
            fields: getOwnStateFields(classDeclaration)
        }));
}

function hasRegisterStateDecorator(classDeclaration: ClassDeclaration): boolean {
    return classDeclaration.getDecorators().some((decorator) => REGISTER_CLASS_DECORATORS.has(decorator.getName()));
}

function getOwnStateFields(classDeclaration: ClassDeclaration): IStateField[] {
    const fields: IStateField[] = [];

    for (const property of classDeclaration.getProperties()) {
        if (!property.hasAccessorKeyword()) {
            continue;
        }

        const decorator = property.getDecorators().find((candidate) => STATE_FIELD_DECORATORS.has(candidate.getName()));
        if (!decorator) {
            continue;
        }

        const kind = STATE_FIELD_DECORATORS.get(decorator.getName());
        if (!kind) {
            continue;
        }

        fields.push({
            name: property.getName(),
            kind
        });
    }

    return fields;
}

function buildGeneratedFile(registeredClasses: IRegisteredClassInfo[]): string {
    const lines: string[] = [];

    lines.push('/* eslint-disable unused-imports/no-unused-imports */');
    lines.push('/* eslint-disable @typescript-eslint/no-empty-function */');
    lines.push('// AUTO-GENERATED - do not edit directly.');
    lines.push('// Re-run scripts/generate-state-serializers.ts to regenerate.');
    lines.push('import {');
    lines.push('    deserializeStateRef,');
    lines.push('    deserializeStateRefArray,');
    lines.push('    deserializeStateRefMap,');
    lines.push('    deserializeStateRefRecord,');
    lines.push('    deserializeStateRefSet,');
    lines.push('    deserializeStateValue,');
    lines.push('    serializeStateRef,');
    lines.push('    serializeStateRefArray,');
    lines.push('    serializeStateRefMap,');
    lines.push('    serializeStateRefRecord,');
    lines.push('    serializeStateRefSet,');
    lines.push('    serializeStateValue,');
    lines.push('    registerStateSerializers,');
    lines.push('    type StateSerializer');
    lines.push('} from \'../StateSerializers\';');
    lines.push('');

    for (const registeredClass of registeredClasses) {
        lines.push(`export const serialize${registeredClass.className}: StateSerializer['serialize'] = (instance) => ({`);
        for (const field of registeredClass.fields) {
            lines.push(`    ${field.name}: ${buildSerializeExpression(field)},`);
        }
        lines.push('});');
        lines.push('');
        lines.push(`export const deserialize${registeredClass.className}: StateSerializer['deserialize'] = (game, instance, state) => {`);
        for (const field of registeredClass.fields) {
            lines.push(`    ${buildDeserializeStatement(field)}`);
        }
        lines.push('};');
        lines.push('');
    }

    lines.push('registerStateSerializers([');
    for (const registeredClass of registeredClasses) {
        lines.push(`    ['${registeredClass.className}', { serialize: serialize${registeredClass.className}, deserialize: deserialize${registeredClass.className} }],`);
    }
    lines.push(']);');

    return `${lines.join('\n')}\n`;
}

function buildSerializeExpression(field: IStateField): string {
    switch (field.kind) {
        case 'primitive':
            return `instance.${field.name}`;
        case 'value':
            return `serializeStateValue(instance.${field.name})`;
        case 'ref':
            return `serializeStateRef(instance.${field.name})`;
        case 'refArray':
            return `serializeStateRefArray(instance.${field.name})`;
        case 'refMap':
            return `serializeStateRefMap(instance.${field.name})`;
        case 'refSet':
            return `serializeStateRefSet(instance.${field.name})`;
        case 'refRecord':
            return `serializeStateRefRecord(instance.${field.name})`;
        default:
            return `instance.${field.name}`;
    }
}

function buildDeserializeStatement(field: IStateField): string {
    switch (field.kind) {
        case 'primitive':
            return `instance.${field.name} = state.${field.name};`;
        case 'value':
            return `instance.${field.name} = deserializeStateValue(state.${field.name});`;
        case 'ref':
            return `instance.${field.name} = deserializeStateRef(game, state.${field.name} as string | null | undefined);`;
        case 'refArray':
            return `instance.${field.name} = deserializeStateRefArray(game, state.${field.name} as string[] | null | undefined);`;
        case 'refMap':
            return `instance.${field.name} = deserializeStateRefMap(game, state.${field.name} as Map<string, string> | null | undefined);`;
        case 'refSet':
            return `instance.${field.name} = deserializeStateRefSet(game, state.${field.name} as Set<string> | null | undefined);`;
        case 'refRecord':
            return `instance.${field.name} = deserializeStateRefRecord(game, state.${field.name} as Record<string, string> | null | undefined);`;
        default:
            return `instance.${field.name} = state.${field.name};`;
    }
}

function writeGeneratedFile(fileContents: string) {
    const generatedDirectoryPath = dirname(GENERATED_FILE_PATH);
    mkdirSync(generatedDirectoryPath, { recursive: true });

    let existingContents = '';
    try {
        existingContents = readFileSync(GENERATED_FILE_PATH, 'utf8');
    } catch {
        existingContents = '';
    }

    if (existingContents === fileContents) {
        console.log(`State serializers unchanged: ${relative(process.cwd(), GENERATED_FILE_PATH)}`);
        return;
    }

    writeFileSync(GENERATED_FILE_PATH, fileContents, 'utf8');
    console.log(`Generated state serializers: ${relative(process.cwd(), GENERATED_FILE_PATH)}`);
}

main();
