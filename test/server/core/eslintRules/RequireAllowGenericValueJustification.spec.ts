import { expectRuleClean, expectRuleReports } from './EslintRuleTesterHarness';

/**
 * `RuleTester` coverage for `eslint-rules/require-allow-generic-value-justification.mjs` (P3-PB1 AC9).
 *
 * Why this spec exists: the rule closes a set of textual bypasses of the
 * `@stateValue({ allowGenericValue: true })` escape hatch, and each of three consecutive review rounds
 * found a *different* shape that still slipped through. Every one of those was verified only by an
 * ad-hoc probe file that was written, run, and deleted, so nothing in CI would have caught a
 * regression. The cases below pin, executably, the shapes the rule's own doc comment claims to close -
 * and, in the final block, the shapes it deliberately does not.
 *
 * `DECORATED_ACCESSOR` keeps each case down to the one thing it varies (how `stateValue` is reached),
 * since the rule's whole subject is callee resolution, not the decorated member.
 */
const RULE = 'require-allow-generic-value-justification';
const MESSAGE_ID = 'requireJustification';

const DECORATED_ACCESSOR = 'private accessor _value: unknown;';

function expectReported(code: string): Promise<void> {
    return expectRuleReports(RULE, code, MESSAGE_ID);
}

function expectClean(code: string): Promise<void> {
    return expectRuleClean(RULE, code);
}

describe('ESLint rule require-allow-generic-value-justification', function() {
    describe('escape-hatch shapes the rule closes,', function() {
        it('reports a bare local identifier bound by a named import', async function() {
            await expectReported(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports an aliased named import', async function() {
            await expectReported(`
                import { stateValue as sv } from './GameObjectUtils';

                class Probe {
                    @sv({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports namespace-member access on a namespace import', async function() {
            await expectReported(`
                import * as GOU from './GameObjectUtils';

                class Probe {
                    @GOU.stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports a plain namespace destructuring', async function() {
            await expectReported(`
                import * as GOU from './GameObjectUtils';

                const { stateValue } = GOU;

                class Probe {
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports a renamed namespace destructuring', async function() {
            await expectReported(`
                import * as GOU from './GameObjectUtils';

                const { stateValue: sv } = GOU;

                class Probe {
                    @sv({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports a const-bound decorator reference', async function() {
            await expectReported(`
                import { stateValue } from './GameObjectUtils';

                const dec = stateValue({ allowGenericValue: true });

                class Probe {
                    @dec
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports an options object reached by indirection', async function() {
            // PB1-R1: the rule flags argument *presence* rather than pattern-matching an inline
            // `{ allowGenericValue: true }` literal, because `stateValue`'s only non-nullary overload is
            // the escape hatch. Aliasing the options object therefore cannot defeat it.
            await expectReported(`
                import { stateValue } from './GameObjectUtils';

                const opts = { allowGenericValue: true };

                class Probe {
                    @stateValue(opts)
                    ${DECORATED_ACCESSOR}
                }
            `);
        });
    });

    describe('import paths carrying a module extension,', function() {
        // PB1-N1: 22 files under server/game/** already import with a trailing `.js`, so this is an
        // ordinary in-repo style rather than a contrived shape. The rule strips the extension before its
        // `endsWith('GameObjectUtils')` check.
        for (const extension of ['.js', '.mjs', '.cjs', '.ts']) {
            it(`reports a named import through a '${extension}' path`, async function() {
                await expectReported(`
                    import { stateValue } from './GameObjectUtils${extension}';

                    class Probe {
                        @stateValue({ allowGenericValue: true })
                        ${DECORATED_ACCESSOR}
                    }
                `);
            });

            it(`reports namespace-member access through a '${extension}' path`, async function() {
                await expectReported(`
                    import * as GOU from '../core/GameObjectUtils${extension}';

                    class Probe {
                        @GOU.stateValue({ allowGenericValue: true })
                        ${DECORATED_ACCESSOR}
                    }
                `);
            });
        }
    });

    describe('accepted use,', function() {
        it('allows a bare stateValue() with no argument', async function() {
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    @stateValue()
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('allows the escape hatch with a justification comment above the decorator', async function() {
            // Mirrors the only real use site in the codebase,
            // server/game/core/ongoingEffect/effectImpl/MutableOngoingEffectValueWrapper.ts.
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                class Probe<TValue> {
                    // allowGenericValue-justified: TValue is this class's own unresolved type parameter,
                    // not a concrete Map/Set/Array - it cannot be proven non-collection at this
                    // declaration site.
                    @stateValue({ allowGenericValue: true })
                    private accessor _value: TValue;
                }
            `);
        });

        it('allows a justification comment attached to the accessor rather than the decorator', async function() {
            // The rule checks comments before the decorator *and* before the accessor node, so a
            // single-line decorator with the comment above the member is equally accepted.
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                class Probe<TValue> {
                    /* allowGenericValue-justified: TValue is an unresolved class type parameter. */
                    @stateValue({ allowGenericValue: true }) private accessor _value: TValue;
                }
            `);
        });

        it('allows an unrelated local function that happens to be named stateValue', async function() {
            // The rule resolves the callee back to GameObjectUtils' export; a same-named local is not it.
            await expectClean(`
                function stateValue(_options: unknown) {
                    return () => undefined;
                }

                class Probe {
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });
    });

    describe('justification length threshold,', function() {
        it('reports a justification shorter than the minimum', async function() {
            await expectReported(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    // allowGenericValue-justified: generic
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('reports a justification one character below the minimum', async function() {
            // Nine characters after the marker; MIN_JUSTIFICATION_LENGTH is 10.
            await expectReported(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    // allowGenericValue-justified: 123456789
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('allows a justification exactly at the minimum', async function() {
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    // allowGenericValue-justified: 1234567890
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });
    });

    /**
     * The rule's doc comment discloses three residual gaps. Two of them are reachable from a single file
     * and so are pinned here as `valid` cases, recording *current behavior* - they are not endorsements,
     * and the shapes below must never be used to dodge a justification. Pinning beats a commented-out
     * case (which asserts nothing and rots silently) and beats omission (which leaves the boundary
     * undocumented in the one place a future reader will actually run). If one of these starts failing,
     * the gap has been closed: that is good news, and the fix is to move the case into the reporting
     * blocks above and update the disclosures in the rule's header comment and in `stateValue`'s doc
     * comment in server/game/core/GameObjectUtils.ts, both of which enumerate these gaps by name.
     *
     * The third disclosed gap - justification honesty, i.e. a plausible-sounding comment on a field that
     * is concretely a Map/Set/Array - is not representable as a RuleTester case at all: the rule never
     * inspects the declared type, so from its perspective such a file is indistinguishable from the
     * legitimate use site above. Closing it needs typed linting. Human review remains the defense for
     * all three.
     */
    describe('documented residual gaps (recorded behavior, NOT endorsed patterns),', function() {
        it('does NOT detect a wrapper function returning stateValue({ allowGenericValue: true })', async function() {
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                function withGeneric() {
                    return stateValue({ allowGenericValue: true });
                }

                class Probe {
                    @withGeneric()
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('does NOT detect the escape hatch reached through a re-export barrel', async function() {
            // The rule only inspects this file's own import declaration, never a second module's
            // `export { stateValue } from './GameObjectUtils'` chain.
            await expectClean(`
                import { stateValue } from './proxy';

                class Probe {
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });

        it('does NOT require the justification to contain ten non-whitespace characters', async function() {
            // MIN_JUSTIFICATION_LENGTH is measured on the trimmed remainder's total length, whitespace
            // included, so a padded two-word "justification" clears it. Recorded so that tightening the
            // check to a non-whitespace count is a visible, deliberate change rather than a silent one.
            await expectClean(`
                import { stateValue } from './GameObjectUtils';

                class Probe {
                    // allowGenericValue-justified: a        b
                    @stateValue({ allowGenericValue: true })
                    ${DECORATED_ACCESSOR}
                }
            `);
        });
    });
});
