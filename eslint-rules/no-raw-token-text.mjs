/**
 * Token categories that should use helper functions instead of raw text.
 *
 * Each category has:
 *   - messageId: key into the `messages` object below
 *   - message: the error message shown to the developer (use {{match}} for the matched text)
 *   - One of:
 *     - names: array of exact words to match (case-sensitive, matched as whole words via \b)
 *     - pattern: a regex string to match (wrapped in a capturing group automatically)
 *     - flags: optional regex flags for pattern-based categories (default: 'gi')
 */
const TOKEN_CATEGORIES = [
    {
        names: ['Aggression', 'Command', 'Cunning', 'Heroism', 'Vigilance', 'Villainy'],
        messageId: 'rawAspectName',
        message: 'Raw aspect name "{{match}}" in string literal. Use the corresponding TextHelper constant (e.g. `TextHelper.Aggression`) or `TextHelper.aspect(Aspect.X)` in a template literal instead, so it can be replaced with an icon on the client side.',
    },
    {
        pattern: 'Keywords?|Ambush|Grit|Overwhelm|Raid\\s+\\d+|Restore\\s+\\d+|Saboteur|Sentinel|Shielded|Bounty|Smuggle|Coordinate|Exploit\\s+\\d+|Piloting|Hidden|Plot',
        flags: 'g',
        messageId: 'rawKeyword',
        message: 'Raw keyword "{{match}}" in string literal. Use the corresponding TextHelper constant (e.g. `TextHelper.Ambush`) in a template literal instead, so it can be styled correctly on the client side.',
    },
    {
        // Matches "pay(s) N resource(s)", "cost(s) N (resources) more/less", and "play(s) (it/them) for N more/less"
        // but NOT "costs N or more/less" (references to printed cost)
        // and NOT "ready/exhaust N resources" (effects that manipulate resources)
        pattern: 'pays?\\s+\\d+\\s+resources?|costs?\\s+\\d+\\s+(?:resources?\\s+)?(?:more|less)|plays?\\s+(?:(?:it|them)\\s+)?for\\s+\\d+\\s+(?:resources?\\s+)?(?:more|less)',
        flags: 'gi',
        messageId: 'rawResourceCost',
        message: 'Raw resource cost "{{match}}" in string literal. Use `TextHelper.resource(N)` in a template literal instead, so it can be replaced with an icon on the client side.',
    },
    // Add more categories as needed, e.g. traits, keywords, etc.
];

// Compile each category into a { regex, messageId } entry
const compiledCategories = TOKEN_CATEGORIES.map((cat) => {
    if (cat.names) {
        return {
            regex: new RegExp(`\\b(${cat.names.join('|')})\\b`, cat.flags || 'g'),
            messageId: cat.messageId,
        };
    }
    // Wrap in word boundaries so a token is only matched as a whole word — e.g. "Smuggle"
    // should not match inside "Smuggled", nor "Plot" inside "Plotting". Every alternative in
    // these patterns starts and ends with a word character, so the boundaries are well-defined.
    return {
        regex: new RegExp(`\\b(${cat.pattern})\\b`, cat.flags || 'gi'),
        messageId: cat.messageId,
    };
});

// Build messages object from categories
const messages = Object.fromEntries(
    TOKEN_CATEGORIES.map((cat) => [cat.messageId, cat.message])
);

/**
 * Some string literals never reach the client as display text, so matching token words inside
 * them is always a false positive. Skip:
 *   - module-source strings (`import ... from './GainKeyword'`, `export ... from`, dynamic import)
 *   - enum member values (`Smuggle = 'whenPlayedUsingSmuggle'`)
 *   - developer-facing error text (`throw new Error(...)`, `Contract.fail(...)`/`Contract.assert*(...)`)
 */
function isExemptContext(node) {
    const parent = node.parent;

    // Module source: the string is the `source` of an import/export/dynamic-import node.
    if (
        parent &&
        (parent.type === 'ImportDeclaration' ||
            parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportAllDeclaration' ||
            parent.type === 'ImportExpression') &&
        parent.source === node
    ) {
        return true;
    }

    // Enum member value: `SomeName = 'someValue'`
    if (parent && parent.type === 'TSEnumMember' && parent.initializer === node) {
        return true;
    }

    // Developer-facing errors: anywhere inside a `throw` statement or a `Contract.*(...)` call.
    for (let cur = parent; cur; cur = cur.parent) {
        if (cur.type === 'ThrowStatement') {
            return true;
        }
        if (
            cur.type === 'CallExpression' &&
            cur.callee &&
            cur.callee.type === 'MemberExpression' &&
            cur.callee.object &&
            cur.callee.object.type === 'Identifier' &&
            cur.callee.object.name === 'Contract'
        ) {
            return true;
        }
    }

    return false;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow raw token text (aspect names, trait names, keywords, etc.) in string literals. Use the appropriate TextHelper function for interpolation instead.',
        },
        messages,
        schema: [],
    },
    create(context) {
        function checkForTokenText(node, value) {
            for (const category of compiledCategories) {
                category.regex.lastIndex = 0;
                let match;
                while ((match = category.regex.exec(value)) !== null) {
                    context.report({
                        node,
                        messageId: category.messageId,
                        data: { match: match[1] },
                    });
                }
            }
        }

        return {
            Literal(node) {
                if (typeof node.value === 'string' && !isExemptContext(node)) {
                    checkForTokenText(node, node.value);
                }
            },
            TemplateElement(node) {
                if (!isExemptContext(node)) {
                    checkForTokenText(node, node.value.raw);
                }
            },
        };
    },
};
