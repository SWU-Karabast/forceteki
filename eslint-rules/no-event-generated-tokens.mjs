/**
 * Disallow reading `.generatedTokens` from an `events[...]` index access.
 *
 * When a token-creation event is replaced (e.g. by Moff Jerjerrod's replacement
 * effect), the original event never resolves and its `generatedTokens` is empty or
 * undefined. Any follow-up effect that needs the created tokens must read them from
 * the resolved (possibly replacement) events via `resolvedEvents[...]?.generatedTokens`
 * instead of `events[...].generatedTokens`.
 * 
 * We will eventually do a code change to add a clearer and safer pattern around this,
 * this rule is just a stopgap for now to keep any new cases from slipping through.
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow reading generatedTokens from events[...]; use resolvedEvents[...]?.generatedTokens so replaced token-creation events (e.g. Moff Jerjerrod) are handled correctly.',
        },
        messages: {
            useResolvedEvents: 'Do not read `.generatedTokens` from `events[...]`. Use `resolvedEvents[...]?.generatedTokens` instead so replaced token-creation events (e.g. Moff Jerjerrod) are handled correctly.',
        },
        schema: [],
    },
    create(context) {
        // Matches `<obj>.events[<idx>]` or `events[<idx>]`
        function isEventsIndexAccess(node) {
            if (node.type !== 'MemberExpression' || !node.computed) {
                return false;
            }

            const object = node.object;
            if (
                object.type === 'MemberExpression' &&
                !object.computed &&
                object.property.type === 'Identifier' &&
                object.property.name === 'events'
            ) {
                return true;
            }

            return object.type === 'Identifier' && object.name === 'events';
        }

        return {
            MemberExpression(node) {
                if (
                    node.property.type === 'Identifier' &&
                    node.property.name === 'generatedTokens' &&
                    isEventsIndexAccess(node.object)
                ) {
                    context.report({ node, messageId: 'useResolvedEvents' });
                }
            },
        };
    },
};
