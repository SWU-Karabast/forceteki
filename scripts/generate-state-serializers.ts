import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import {
    type CallExpression,
    type ClassDeclaration,
    type Expression,
    type FunctionDeclaration,
    Node,
    Project,
    type Symbol,
    SyntaxKind,
    type VariableDeclaration
} from 'ts-morph';

type StateDecoratorKind = 'primitive' | 'value' | 'ref' | 'refArray' | 'refMap' | 'refSet' | 'refRecord';

interface IStateField {
    name: string;
    kind: StateDecoratorKind;
}

interface IStateFieldWithSource extends IStateField {
    sourceDescription: string;
}

interface IRegisteredClassInfo {
    className: string;
    fields: IStateField[];
}

interface IStateClassInfo {
    className: string;
    declaration: ClassDeclaration;
    shouldGenerateSerializer: boolean;
    ownFields: IStateFieldWithSource[];
}

interface IResolvedClassNode {
    classInfo: IStateClassInfo;
    parent: IResolvedClassNode | null;
}

interface IMixinResolutionContext {
    functionDeclaration: FunctionDeclaration;
    mixinName: string;
    baseParameterName: string;
    baseArgument: Expression | null;
    parentContext: IMixinResolutionContext | null;
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
    const decoratedClasses = new Map<string, IStateClassInfo>();
    const serializerClassNames = new Set<string>();
    const resolvedClassNodes = new Map<string, IResolvedClassNode>();

    for (const sourceFile of project.getSourceFiles('server/**/*.ts')) {
        if (sourceFile.getFilePath().endsWith(GENERATED_FILE_PATH.split('/').join('\\'))) {
            continue;
        }

        for (const classDeclaration of sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration)) {
            if (!hasRegisterStateDecorator(classDeclaration)) {
                continue;
            }

            const classInfo = createStateClassInfo(classDeclaration);
            const existingClass = decoratedClasses.get(classInfo.className);
            if (existingClass) {
                throw new Error(
                    `Duplicate @registerState class name "${classInfo.className}" found in ${getNodeLocation(classInfo.declaration)} and ${getNodeLocation(existingClass.declaration)}`
                );
            }

            decoratedClasses.set(classInfo.className, classInfo);
            if (classInfo.shouldGenerateSerializer) {
                serializerClassNames.add(classInfo.className);
            }
        }
    }

    return Array.from(serializerClassNames.values())
        .map((className) => {
            const classInfo = decoratedClasses.get(className);
            if (!classInfo) {
                throw new Error(`Unable to resolve serializer generation target "${className}"`);
            }

            return classInfo;
        })
        .sort((left, right) => left.className.localeCompare(right.className))
        .map((classInfo) => {
            const resolvedNode = resolveClassNode(classInfo, decoratedClasses, resolvedClassNodes);
            const aggregatedFields = aggregateStateFields(resolvedNode);

            return {
                className: classInfo.className,
                fields: aggregatedFields.map(({ name, kind }) => ({ name, kind }))
            };
        });
}

function createStateClassInfo(classDeclaration: ClassDeclaration): IStateClassInfo {
    const className = classDeclaration.getName();
    if (!className) {
        throw new Error(`Encountered an anonymous @registerState class in ${getNodeLocation(classDeclaration)}`);
    }

    return {
        className,
        declaration: classDeclaration,
        shouldGenerateSerializer: hasConcreteRegisterStateDecorator(classDeclaration),
        ownFields: getOwnStateFields(classDeclaration)
    };
}

function resolveClassNode(
    classInfo: IStateClassInfo,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>
): IResolvedClassNode {
    const cachedNode = resolvedClassNodes.get(classInfo.className);
    if (cachedNode) {
        return cachedNode;
    }

    const resolvedNode: IResolvedClassNode = {
        classInfo,
        parent: null
    };
    resolvedClassNodes.set(classInfo.className, resolvedNode);

    resolvedNode.parent = resolveParentClassNode(classInfo.declaration, decoratedClasses, resolvedClassNodes, getStandaloneMixinContext(classInfo.declaration));
    return resolvedNode;
}

function resolveParentClassNode(
    classDeclaration: ClassDeclaration,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>,
    mixinContext: IMixinResolutionContext | null
): IResolvedClassNode | null {
    const extendsExpression = classDeclaration.getExtends();
    if (!extendsExpression) {
        return null;
    }

    return resolveStateNodeFromExpression(extendsExpression.getExpression(), decoratedClasses, resolvedClassNodes, mixinContext);
}

function resolveStateNodeFromExpression(
    expression: Expression,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>,
    mixinContext: IMixinResolutionContext | null
): IResolvedClassNode | null {
    const normalizedExpression = unwrapExpression(expression);

    if (Node.isIdentifier(normalizedExpression)) {
        if (mixinContext && normalizedExpression.getText() === mixinContext.baseParameterName) {
            if (!mixinContext.baseArgument) {
                return null;
            }

            return resolveStateNodeFromExpression(mixinContext.baseArgument, decoratedClasses, resolvedClassNodes, mixinContext.parentContext);
        }

        const classInfo = decoratedClasses.get(normalizedExpression.getText());
        if (classInfo) {
            return resolveClassNode(classInfo, decoratedClasses, resolvedClassNodes);
        }

        const variableDeclaration = normalizedExpression.getDefinitions()[0]?.getDeclarationNode();
        if (variableDeclaration && Node.isVariableDeclaration(variableDeclaration)) {
            return resolveStateNodeFromVariableDeclaration(variableDeclaration, decoratedClasses, resolvedClassNodes, mixinContext);
        }

        const symbol = normalizedExpression.getSymbol() ?? normalizedExpression.getType().getSymbol();
        const classDeclaration = symbol?.getDeclarations().find(Node.isClassDeclaration);
        if (classDeclaration && hasRegisterStateDecorator(classDeclaration)) {
            const classInfoFromDeclaration = createStateClassInfo(classDeclaration);
            const existingClassInfo = decoratedClasses.get(classInfoFromDeclaration.className) ?? classInfoFromDeclaration;
            if (!decoratedClasses.has(existingClassInfo.className)) {
                decoratedClasses.set(existingClassInfo.className, existingClassInfo);
            }
            return resolveClassNode(existingClassInfo, decoratedClasses, resolvedClassNodes);
        }

        throw new Error(`Unable to resolve state parent identifier "${normalizedExpression.getText()}" from ${getNodeLocation(normalizedExpression)}`);
    }

    if (Node.isCallExpression(normalizedExpression)) {
        return resolveStateNodeFromCallExpression(normalizedExpression, decoratedClasses, resolvedClassNodes, mixinContext);
    }

    if (Node.isClassExpression(normalizedExpression)) {
        throw new Error(`Encountered unsupported class expression in state inheritance at ${getNodeLocation(normalizedExpression)}`);
    }

    throw new Error(`Unsupported state parent expression "${normalizedExpression.getText()}" at ${getNodeLocation(normalizedExpression)}`);
}

function resolveStateNodeFromVariableDeclaration(
    variableDeclaration: VariableDeclaration,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>,
    mixinContext: IMixinResolutionContext | null
): IResolvedClassNode | null {
    const initializer = variableDeclaration.getInitializer();
    if (!initializer) {
        throw new Error(`State parent alias "${variableDeclaration.getName()}" has no initializer at ${getNodeLocation(variableDeclaration)}`);
    }

    return resolveStateNodeFromExpression(initializer, decoratedClasses, resolvedClassNodes, mixinContext);
}

function resolveStateNodeFromCallExpression(
    callExpression: CallExpression,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>,
    outerMixinContext: IMixinResolutionContext | null
): IResolvedClassNode | null {
    const resolvedCall = callExpression.getExpression();
    const callTarget = unwrapExpression(resolvedCall);
    const mixinIdentifier = Node.isIdentifier(callTarget) ? callTarget : null;
    const mixinName = mixinIdentifier?.getText() ?? callExpression.getExpression().getText();

    const mixinFunction = resolveFunctionDeclarationFromCall(callExpression);
    if (!mixinFunction) {
        throw new Error(`Unable to resolve mixin factory "${mixinName}" from ${getNodeLocation(callExpression)}`);
    }

    const baseArgument = callExpression.getArguments()[0];
    if (!baseArgument || !Node.isExpression(baseArgument)) {
        throw new Error(`Mixin factory "${mixinName}" is missing its base class argument at ${getNodeLocation(callExpression)}`);
    }

    const baseParameter = mixinFunction.getParameters()[0];
    if (!baseParameter) {
        throw new Error(`Mixin factory "${mixinName}" does not declare a base parameter at ${getNodeLocation(mixinFunction)}`);
    }

    const mixinContext: IMixinResolutionContext = {
        functionDeclaration: mixinFunction,
        mixinName,
        baseParameterName: baseParameter.getName(),
        baseArgument,
        parentContext: outerMixinContext,
    };

    return resolveReturnedMixinNode(mixinContext, decoratedClasses, resolvedClassNodes);
}

function resolveMixinClassNode(
    classInfo: IStateClassInfo,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>,
    mixinContext: IMixinResolutionContext
): IResolvedClassNode {
    const cacheKey = `${getNodeLocation(mixinContext.functionDeclaration)}::${classInfo.className}::${buildMixinContextCacheKey(mixinContext)}`;
    const cachedNode = resolvedClassNodes.get(cacheKey);
    if (cachedNode) {
        return cachedNode;
    }

    const resolvedNode: IResolvedClassNode = {
        classInfo,
        parent: null
    };
    resolvedClassNodes.set(cacheKey, resolvedNode);

    const extendsExpression = classInfo.declaration.getExtends();
    resolvedNode.parent = extendsExpression
        ? resolveStateNodeFromExpression(extendsExpression.getExpression(), decoratedClasses, resolvedClassNodes, mixinContext)
        : null;

    return resolvedNode;
}

function resolveReturnedMixinNode(
    mixinContext: IMixinResolutionContext,
    decoratedClasses: Map<string, IStateClassInfo>,
    resolvedClassNodes: Map<string, IResolvedClassNode>
): IResolvedClassNode {
    const functionBody = mixinContext.functionDeclaration.getBody();
    if (!functionBody) {
        throw new Error(`Mixin factory "${mixinContext.mixinName}" has no body at ${getNodeLocation(mixinContext.functionDeclaration)}`);
    }
    if (!Node.isBlock(functionBody)) {
        throw new Error(`Mixin factory "${mixinContext.mixinName}" must use a block body at ${getNodeLocation(mixinContext.functionDeclaration)}`);
    }

    const returnStatements = functionBody.getStatements().filter(Node.isReturnStatement);
    for (const returnStatement of returnStatements) {
        const expression = returnStatement.getExpression();
        if (!expression) {
            continue;
        }

        const normalizedExpression = unwrapExpression(expression);
        if (Node.isIdentifier(normalizedExpression)) {
            const declarationNode = normalizedExpression.getDefinitions()[0]?.getDeclarationNode();
            if (!declarationNode) {
                continue;
            }

            if (Node.isClassDeclaration(declarationNode)) {
                const classInfo = createStateClassInfo(declarationNode);
                const existingClassInfo = decoratedClasses.get(classInfo.className);
                if (!existingClassInfo) {
                    decoratedClasses.set(classInfo.className, classInfo);
                    return resolveMixinClassNode(classInfo, decoratedClasses, resolvedClassNodes, mixinContext);
                }
                return resolveMixinClassNode(existingClassInfo, decoratedClasses, resolvedClassNodes, mixinContext);
            }

            if (Node.isVariableDeclaration(declarationNode)) {
                const resolvedNode = resolveStateNodeFromVariableDeclaration(declarationNode, decoratedClasses, resolvedClassNodes, mixinContext);
                if (resolvedNode) {
                    return resolvedNode;
                }
                continue;
            }
        }

        if (Node.isCallExpression(normalizedExpression)) {
            const resolvedNode = resolveStateNodeFromExpression(normalizedExpression, decoratedClasses, resolvedClassNodes, mixinContext);
            if (resolvedNode) {
                return resolvedNode;
            }
        }

        if (Node.isClassExpression(normalizedExpression)) {
            throw new Error(`Unsupported mixin return via class expression in "${mixinContext.mixinName}" at ${getNodeLocation(normalizedExpression)}`);
        }
    }

    throw new Error(`Unable to resolve returned class for mixin factory "${mixinContext.mixinName}" at ${getNodeLocation(mixinContext.functionDeclaration)}`);
}

function resolveFunctionDeclarationFromCall(callExpression: CallExpression): FunctionDeclaration | null {
    const callTarget = unwrapExpression(callExpression.getExpression());
    const identifier = Node.isIdentifier(callTarget) ? callTarget : null;
    if (!identifier) {
        return null;
    }

    const symbol = getResolvedSymbol(identifier);
    return symbol?.getDeclarations().find(Node.isFunctionDeclaration) ?? null;
}

function getResolvedSymbol(node: Node): Symbol | undefined {
    const symbol = Node.isIdentifier(node)
        ? (node.getSymbol() ?? node.getType().getSymbol())
        : node.getSymbol();

    return symbol?.getAliasedSymbol() ?? symbol;
}

function buildMixinContextCacheKey(mixinContext: IMixinResolutionContext | null): string {
    if (!mixinContext) {
        return 'ROOT';
    }

    const baseArgumentText = mixinContext.baseArgument?.getText() ?? '__UNRESOLVED_BASE__';
    return `${getNodeLocation(mixinContext.functionDeclaration)}(${baseArgumentText})->${buildMixinContextCacheKey(mixinContext.parentContext)}`;
}

function getStandaloneMixinContext(classDeclaration: ClassDeclaration): IMixinResolutionContext | null {
    const parentFunction = classDeclaration.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);
    if (!parentFunction) {
        return null;
    }

    const className = classDeclaration.getName();
    if (!className) {
        return null;
    }

    const returnsClass = parentFunction.getDescendantsOfKind(SyntaxKind.ReturnStatement)
        .some((returnStatement) => returnStatement.getExpression()?.getText() === className);
    if (!returnsClass) {
        return null;
    }

    const baseParameter = parentFunction.getParameters()[0];
    if (!baseParameter) {
        return null;
    }

    return {
        functionDeclaration: parentFunction,
        mixinName: parentFunction.getName() ?? '<anonymous-mixin>',
        baseParameterName: baseParameter.getName(),
        baseArgument: null,
        parentContext: null,
    };
}

function aggregateStateFields(classNode: IResolvedClassNode): IStateFieldWithSource[] {
    const chain = flattenClassChain(classNode);
    const fieldsByName = new Map<string, IStateFieldWithSource>();
    const aggregatedFields: IStateFieldWithSource[] = [];

    for (const node of chain) {
        for (const field of node.classInfo.ownFields) {
            const existingField = fieldsByName.get(field.name);
            if (existingField) {
                throw new Error(
                    `Duplicate state field "${field.name}" found in ${existingField.sourceDescription} and ${field.sourceDescription}`
                );
            }

            fieldsByName.set(field.name, field);
            aggregatedFields.push(field);
        }
    }

    return aggregatedFields;
}

function flattenClassChain(classNode: IResolvedClassNode): IResolvedClassNode[] {
    const chain: IResolvedClassNode[] = [];

    let currentNode: IResolvedClassNode | null = classNode;
    while (currentNode) {
        chain.unshift(currentNode);
        currentNode = currentNode.parent;
    }

    return chain;
}

function hasRegisterStateDecorator(classDeclaration: ClassDeclaration): boolean {
    return classDeclaration.getDecorators().some((decorator) => REGISTER_CLASS_DECORATORS.has(decorator.getName()));
}

function hasConcreteRegisterStateDecorator(classDeclaration: ClassDeclaration): boolean {
    return classDeclaration.getDecorators().some((decorator) => decorator.getName() === 'registerState');
}

function getOwnStateFields(classDeclaration: ClassDeclaration): IStateFieldWithSource[] {
    const fields: IStateFieldWithSource[] = [];

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
            kind,
            sourceDescription: `${classDeclaration.getName() ?? '<anonymous>'}.${property.getName()} (${getNodeLocation(property)})`
        });
    }

    return fields;
}

function unwrapExpression(expression: Expression): Expression {
    let currentExpression = expression;

    while (
        Node.isParenthesizedExpression(currentExpression) ||
        Node.isAsExpression(currentExpression) ||
        Node.isTypeAssertion(currentExpression) ||
        Node.isSatisfiesExpression(currentExpression) ||
        Node.isNonNullExpression(currentExpression)
    ) {
        currentExpression = currentExpression.getExpression();
    }

    return currentExpression;
}

function getNodeLocation(node: Node): string {
    const sourceFile = node.getSourceFile();
    const line = sourceFile.getLineAndColumnAtPos(node.getStart()).line;
    const relativePath = relative(process.cwd(), sourceFile.getFilePath()).split('\\')
        .join('/');
    return `${relativePath}#L${line}`;
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
    lines.push('    registerStateDeltaSerializers,');
    lines.push('    registerStateSerializers,');
    lines.push('    type StateDeltaSerializer,');
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

        lines.push(`export const delta${registeredClass.className}: StateDeltaSerializer = {`);
        for (const field of registeredClass.fields) {
            lines.push(`    ${field.name}: {`);
            lines.push(`        serialize: ${buildDeltaSerializeExpression(field)},`);
            lines.push(`        deserialize: ${buildDeltaDeserializeExpression(field)},`);
            lines.push('    },');
        }
        lines.push('};');
        lines.push('');
    }

    lines.push('registerStateSerializers([');
    for (const registeredClass of registeredClasses) {
        lines.push(`    ['${registeredClass.className}', { serialize: serialize${registeredClass.className}, deserialize: deserialize${registeredClass.className} }],`);
    }
    lines.push(']);');
    lines.push('');
    lines.push('registerStateDeltaSerializers([');
    for (const registeredClass of registeredClasses) {
        lines.push(`    ['${registeredClass.className}', delta${registeredClass.className}],`);
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

function buildDeltaSerializeExpression(field: IStateField): string {
    switch (field.kind) {
        case 'primitive':
            return '(value) => value';
        case 'value':
            return '(value) => serializeStateValue(value)';
        case 'ref':
            return '(value) => serializeStateRef(value)';
        case 'refArray':
            return '(value) => serializeStateRefArray(value)';
        case 'refMap':
            return '(value) => serializeStateRefMap(value)';
        case 'refSet':
            return '(value) => serializeStateRefSet(value)';
        case 'refRecord':
            return '(value) => serializeStateRefRecord(value)';
        default:
            return '(value) => value';
    }
}

function buildDeltaDeserializeExpression(field: IStateField): string {
    switch (field.kind) {
        case 'primitive':
            return '(_game, value) => value';
        case 'value':
            return '(_game, value) => deserializeStateValue(value)';
        case 'ref':
            return '(game, value) => deserializeStateRef(game, value as string | null | undefined)';
        case 'refArray':
            return '(game, value) => deserializeStateRefArray(game, value as string[] | null | undefined)';
        case 'refMap':
            return '(game, value) => deserializeStateRefMap(game, value as Map<string, string> | null | undefined)';
        case 'refSet':
            return '(game, value) => deserializeStateRefSet(game, value as Set<string> | null | undefined)';
        case 'refRecord':
            return '(game, value) => deserializeStateRefRecord(game, value as Record<string, string> | null | undefined)';
        default:
            return '(_game, value) => value';
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
