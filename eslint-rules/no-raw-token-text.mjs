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
        // Title-cased trait names, matched case-sensitively so only display-style references are
        // flagged (e.g. "Force" the trait, not lowercase uses). Keep in sync with the `Trait` enum
        // in server/game/core/Constants.ts. Some traits are common English words (Item, Plan, Night,
        // Law, Tank, etc.); when a match is genuinely NOT a trait reference, suppress it with
        // `// eslint-disable-next-line forceteki/no-raw-token-text -- <reason>`.
        //
        // The "the Force" game concept (the Force token) is common and is NOT the Force trait, so it
        // is auto-ignored via `ignore` below. Genuine trait references like "the Force trait/unit/card"
        // are still flagged.
        names: [
            'Armor', 'Bounty Hunter', 'Bounty', 'Capital Ship', 'Clone', 'Condition', 'Creature',
            'Disaster', 'Droid', 'Ewok', 'Fighter', 'First Order', 'Force', 'Fringe', 'Gambit',
            'Gungan', 'Hutt', 'Imperial', 'Innate', 'Inquisitor', 'Item', 'Jawa', 'Jedi', 'Kaminoan',
            'Law', 'Learned', 'Lightsaber', 'Mandalorian', 'Modification', 'Musician', 'Naboo',
            'New Republic', 'Night', 'Nihil', 'Official', 'Pilot', 'Plan', 'Rebel', 'Republic',
            'Resistance', 'Separatist', 'Sith', 'Spectre', 'Speeder', 'Supply', 'Tactic', 'Tank',
            'Transport', 'Trick', 'Trooper', 'Tusken', 'Twi\'lek', 'Undead', 'Underworld', 'Vehicle',
            'Walker', 'Weapon', 'Wookiee',
        ],
        messageId: 'rawTraitName',
        message: 'Raw trait name "{{match}}" in string literal. Use the corresponding TextHelper constant (e.g. `TextHelper.Trait.BountyHunter`) or `TextHelper.trait(Trait.X)` in a template literal instead, so it can be styled correctly on the client side. If this is not a trait reference, suppress with an eslint-disable-next-line comment explaining why.',
        // Skip the "the Force" game concept (but keep flagging "the Force trait/unit/card"). The
        // token to skip is captured in group 1.
        ignore: '\\bthe\\s+(Force)\\b(?!\\s+(?:trait|units?|cards?)\\b)',
        ignoreFlags: 'gi',
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
    // Add more categories as needed.
];

// Compile each category into a { regex, messageId, ignore } entry. An optional `ignore` regex
// (with the token to skip captured in group 1) suppresses matches in known non-token contexts.
const compiledCategories = TOKEN_CATEGORIES.map((cat) => {
    const ignore = cat.ignore ? new RegExp(cat.ignore, cat.ignoreFlags || 'gi') : null;

    if (cat.names) {
        // Sort longest-first so multi-word names win over their prefixes in the alternation
        // (e.g. "Bounty Hunter" is tried before "Bounty", "New Republic" before "Republic").
        const alternation = [...cat.names].sort((a, b) => b.length - a.length).join('|');
        return {
            regex: new RegExp(`\\b(${alternation})\\b`, cat.flags || 'g'),
            messageId: cat.messageId,
            ignore,
        };
    }
    // Wrap in word boundaries so a token is only matched as a whole word — e.g. "Smuggle"
    // should not match inside "Smuggled", nor "Plot" inside "Plotting". Every alternative in
    // these patterns starts and ends with a word character, so the boundaries are well-defined.
    return {
        regex: new RegExp(`\\b(${cat.pattern})\\b`, cat.flags || 'gi'),
        messageId: cat.messageId,
        ignore,
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
                // Collect the start indices of token matches that should be ignored (e.g. the
                // "the Force" game concept). The ignore regex captures the token in group 1, so
                // its offset within the full ignore match gives the token's start index.
                const ignoredStarts = new Set();
                if (category.ignore) {
                    category.ignore.lastIndex = 0;
                    let ignoreMatch;
                    while ((ignoreMatch = category.ignore.exec(value)) !== null) {
                        ignoredStarts.add(ignoreMatch.index + ignoreMatch[0].indexOf(ignoreMatch[1]));
                        if (ignoreMatch.index === category.ignore.lastIndex) {
                            category.ignore.lastIndex++;
                        }
                    }
                }

                category.regex.lastIndex = 0;
                let match;
                while ((match = category.regex.exec(value)) !== null) {
                    if (ignoredStarts.has(match.index)) {
                        continue;
                    }
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
