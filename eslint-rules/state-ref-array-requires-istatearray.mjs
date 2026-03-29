function isStateRefArrayFalseDecorator(decorator) {
    if (decorator?.type !== 'Decorator') {
        return false;
    }

    const expression = decorator.expression;
    if (expression?.type !== 'CallExpression') {
        return false;
    }

    if (expression.callee?.type !== 'Identifier' || expression.callee.name !== 'stateRefArray') {
        return false;
    }

    return expression.arguments[0]?.type === 'Literal' && expression.arguments[0].value === false;
}

function hasNamedImport(importDeclaration, importedName) {
    return importDeclaration.specifiers?.some(
        (specifier) => specifier.type === 'ImportSpecifier' && specifier.imported?.type === 'Identifier' && specifier.imported.name === importedName
    ) ?? false;
}

function findStateRefArrayImport(programBody) {
    return programBody.find(
        (statement) => statement.type === 'ImportDeclaration' && hasNamedImport(statement, 'stateRefArray')
    ) ?? null;
}

function findTypeOnlyImportForSource(programBody, sourceValue) {
    return programBody.find(
        (statement) => statement.type === 'ImportDeclaration' && statement.importKind === 'type' && statement.source.value === sourceValue
    ) ?? null;
}

function hasTopLevelIStateArrayBinding(programBody) {
    for (const statement of programBody) {
        if (statement.type === 'ImportDeclaration' && statement.specifiers?.some((specifier) => specifier.local?.name === 'IStateArray')) {
            return true;
        }

        if (statement.type === 'TSInterfaceDeclaration' || statement.type === 'TSTypeAliasDeclaration' || statement.type === 'ClassDeclaration') {
            if (statement.id?.name === 'IStateArray') {
                return true;
            }
        }
    }

    return false;
}

function getConvertibleElementTypeText(typeAnnotation, sourceCode) {
    if (typeAnnotation == null) {
        return null;
    }

    if (typeAnnotation.type === 'TSArrayType') {
        return sourceCode.getText(typeAnnotation.elementType);
    }

    if (typeAnnotation.type === 'TSTypeOperator' && typeAnnotation.operator === 'readonly') {
        return getConvertibleElementTypeText(typeAnnotation.typeAnnotation, sourceCode);
    }

    if (typeAnnotation.type !== 'TSTypeReference') {
        return null;
    }

    if (typeAnnotation.typeName?.type !== 'Identifier') {
        return null;
    }

    if (typeAnnotation.typeName.name !== 'Array' && typeAnnotation.typeName.name !== 'ReadonlyArray') {
        return null;
    }

    const [elementType] = typeAnnotation.typeArguments?.params ?? [];
    if (elementType == null) {
        return null;
    }

    return sourceCode.getText(elementType);
}

function getIStateArrayReplacementText(typeAnnotation, sourceCode) {
    const elementTypeText = getConvertibleElementTypeText(typeAnnotation, sourceCode);
    if (elementTypeText == null) {
        return null;
    }

    return `IStateArray<${elementTypeText}>`;
}

function isValidIStateArrayAnnotation(typeAnnotation) {
    if (typeAnnotation?.type !== 'TSTypeReference') {
        return false;
    }

    if (typeAnnotation.typeName?.type !== 'Identifier' || typeAnnotation.typeName.name !== 'IStateArray') {
        return false;
    }

    return typeAnnotation.typeArguments?.type === 'TSTypeParameterInstantiation' && typeAnnotation.typeArguments.params.length === 1;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'Require IStateArray<T> for accessors decorated with @stateRefArray(false).',
        },
        messages: {
            requireIStateArray: '@stateRefArray(false) accessors must declare type IStateArray<T> so direct index mutation remains disallowed.',
            requireExplicitIStateArray: '@stateRefArray(false) accessors must declare an explicit IStateArray<T> type annotation.',
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            AccessorProperty(node) {
                if (!node.decorators?.some(isStateRefArrayFalseDecorator)) {
                    return;
                }

                const declaredType = node.typeAnnotation?.typeAnnotation;
                if (isValidIStateArrayAnnotation(declaredType)) {
                    return;
                }

                if (declaredType == null) {
                    context.report({
                        node,
                        messageId: 'requireExplicitIStateArray',
                    });
                    return;
                }

                context.report({
                    node: node.typeAnnotation,
                    messageId: 'requireIStateArray'
                });
            },
        };
    },
};