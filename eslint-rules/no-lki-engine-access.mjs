/**
 * Keep card code on the card-facing side of last known information (D-28).
 *
 * Card code reads a card through the card state getter its setup receives, and holds references to
 * cards as `ICardReference`, which has no way back to the live card. The engine's side of those types
 * has escape hatches around that: the live card behind a reference, the registry, and the game's own
 * getter, which is not the one chosen for the card's opt-in and can resolve a reference to a card.
 * The types already keep them out of reach; this rule catches the casts and the untyped values that
 * get past the types.
 *
 * Flags, in card implementations:
 * - reading an engine-only member, by name, from any object: `getCardForEngine`, `createForRegistry`,
 *   `fromCardReference`, `isCurrent`, `deref`, `lkiRegistry`, and `cardStates` (the game's getter;
 *   the card's own getter is the `cardStates` parameter, which is not a member read)
 * - importing anything from the LKI modules other than the card-facing types: `ICardReference`,
 *   `ICardStateGetter`, and the property interfaces
 */

const engineOnlyMembers = new Set([
    'getCardForEngine',
    'createForRegistry',
    'fromCardReference',
    'isCurrent',
    'deref',
    'lkiRegistry',
    'cardStates',
]);

/** The card-facing names each LKI module exports. `null` allows every name the module exports. */
const cardFacingExports = new Map([
    ['CardRef', new Set(['ICardReference'])],
    ['CardStateGetter', new Set(['ICardStateGetter'])],
    ['CardPropertiesInterfaces', null],
]);

function lkiModuleName(source) {
    const match = /(?:^|\/)lki\/([^/]+)$/.exec(source);
    return match ? match[1] : null;
}

function memberName(node) {
    if (!node.computed && node.property.type === 'Identifier') {
        return node.property.name;
    }
    if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
        return node.property.value;
    }
    return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow engine-only last known information members and imports in card code; read cards through the card state getter (D-28).',
        },
        messages: {
            engineMember: '`{{name}}` is engine-only. Card code reads a card through the `cardStates` getter its setup receives: `getLastKnownProperties(ref)` or `getCurrentProperties(cardOrRef)` (D-28).',
            gameGetter: 'Use the `cardStates` parameter of the card\'s setup, not the game\'s getter: the parameter is the getter chosen for this card\'s opt-in (`Card.usesLkiRegistry`), and it has no engine-only members (D-28, D-35).',
            engineImport: '`{{name}}` is engine-only. Card code imports only the card-facing types from the LKI modules: `ICardReference`, `ICardStateGetter` and the property interfaces (D-28).',
        },
        schema: [],
    },
    create(context) {
        function reportMember(node, name) {
            if (name === 'cardStates') {
                context.report({ node, messageId: 'gameGetter' });
            } else {
                context.report({ node, messageId: 'engineMember', data: { name } });
            }
        }

        return {
            MemberExpression(node) {
                const name = memberName(node);
                if (name !== null && engineOnlyMembers.has(name)) {
                    reportMember(node.property, name);
                }
            },

            // `const { getCardForEngine } = ref`
            'ObjectPattern > Property'(node) {
                if (!node.computed && node.key.type === 'Identifier' && engineOnlyMembers.has(node.key.name)) {
                    reportMember(node.key, node.key.name);
                }
            },

            ImportDeclaration(node) {
                const moduleName = lkiModuleName(node.source.value);
                if (moduleName === null) {
                    return;
                }

                const allowed = cardFacingExports.has(moduleName) ? cardFacingExports.get(moduleName) : new Set();
                if (allowed === null) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    const name = specifier.type === 'ImportSpecifier' ? specifier.imported.name : '*';
                    if (!allowed.has(name)) {
                        context.report({ node: specifier, messageId: 'engineImport', data: { name: name === '*' ? moduleName : name } });
                    }
                }
            },
        };
    },
};
