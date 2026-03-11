/**
 * Token categories that should use helper functions instead of raw text.
 * To add a new category, add an entry with:
 *   - names: array of exact words to match (case-sensitive, matched as whole words)
 *   - messageId: key into the `messages` object below
 *   - helper: the recommended helper call to show in the error message
 */
const TOKEN_CATEGORIES = [
    {
        names: ['Aggression', 'Command', 'Cunning', 'Heroism', 'Vigilance', 'Villainy'],
        messageId: 'rawAspectName',
        helper: 'TextHelper.aspect(Aspect.{{name}})',
    },
    // Add more categories as needed, e.g. traits, keywords, etc.
];

// Build a single combined regex and a lookup map from name → category
const nameToCategory = new Map();
const allNames = [];
for (const category of TOKEN_CATEGORIES) {
    for (const name of category.names) {
        nameToCategory.set(name, category);
        allNames.push(name);
    }
}
const combinedPattern = new RegExp(`\\b(${allNames.join('|')})\\b`, 'g');

// Build messages object from categories
const messages = Object.fromEntries(
    TOKEN_CATEGORIES.map((cat) => [
        cat.messageId,
        `Raw ${cat.messageId.replace('raw', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} "{{name}}" found in string literal. Use \`\${${cat.helper}}\` in a template literal instead.`,
    ])
);

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
            combinedPattern.lastIndex = 0;
            let match;
            while ((match = combinedPattern.exec(value)) !== null) {
                const name = match[1];
                const category = nameToCategory.get(name);
                context.report({
                    node,
                    messageId: category.messageId,
                    data: { name },
                });
            }
        }

        return {
            Literal(node) {
                if (typeof node.value === 'string') {
                    checkForTokenText(node, node.value);
                }
            },
            TemplateElement(node) {
                checkForTokenText(node, node.value.raw);
            },
        };
    },
};
