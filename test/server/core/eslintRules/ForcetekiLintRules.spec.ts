import { expectRuleClean, expectRuleReports } from './EslintRuleTesterHarness';

/**
 * Smoke coverage for the three custom ESLint rules other than
 * `require-allow-generic-value-justification`, which has its own, much fuller spec next to this one.
 *
 * Deliberately one reporting case and one accepted case per rule: enough that a rule silently ceasing
 * to load, parse, or fire fails CI, without claiming to pin each rule's full matching surface the way
 * the sibling spec does. Extend a rule's block here when that rule next gets a behavior change worth
 * locking down.
 */
describe('Forceteki custom ESLint rules', function() {
    describe('no-event-generated-tokens,', function() {
        const RULE = 'no-event-generated-tokens';

        it('reports reading generatedTokens off an events[...] index access', async function() {
            await expectRuleReports(RULE, 'const tokens = events[0].generatedTokens;', 'useResolvedEvents');
        });

        it('allows reading generatedTokens off resolvedEvents[...]', async function() {
            await expectRuleClean(RULE, 'const tokens = resolvedEvents[0]?.generatedTokens;');
        });
    });

    describe('state-ref-array-requires-istatearray,', function() {
        const RULE = 'state-ref-array-requires-istatearray';

        it('reports a @stateRefArray(false) accessor declared as a plain array', async function() {
            await expectRuleReports(RULE, `
                class Probe {
                    @stateRefArray(false)
                    private accessor items: Card[];
                }
            `, 'requireIStateArray');
        });

        it('allows a @stateRefArray(false) accessor declared as IStateArray<T>', async function() {
            await expectRuleClean(RULE, `
                class Probe {
                    @stateRefArray(false)
                    private accessor items: IStateArray<Card>;
                }
            `);
        });
    });

    describe('no-raw-token-text,', function() {
        const RULE = 'no-raw-token-text';

        it('reports a raw aspect name in a string literal', async function() {
            await expectRuleReports(RULE, `
                const message = 'Gain Aggression';
            `, 'rawAspectName');
        });

        it('allows a raw aspect name in developer-facing error text', async function() {
            // Text inside a `throw` never reaches the client, so it is an exempt context.
            await expectRuleClean(RULE, `
                throw new Error('unexpected Aggression value');
            `);
        });
    });
});
