/**
 * Meta-tests for the trigger-prompt test harness itself: clickTrigger / clickPass and the
 * toHavePassableTriggerPrompt / toHaveExactTriggerResolutionPrompt matchers. These pin the behavior we
 * rely on across the suite — shape-agnostic dispatch (standalone optional prompt vs. simultaneous
 * resolution prompt), reference matching by ability text or source card, and the error messaging for
 * every throwing scenario — so regressions in the helpers surface here instead of silently elsewhere.
 */
describe('Trigger-prompt test helpers', function() {
    integration(function(contextRef) {
        describe('with a standalone optional-trigger prompt (a single optional trigger — Rugged Survivors)', function() {
            const abilityText = 'Draw a card if you control a leader unit';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                // Attacking triggers Rugged Survivors' sole optional "On Attack" ability, which (with a
                // deployed leader in play) has a legal effect and so shows the standalone optional prompt.
                const { context } = contextRef;
                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                context.ignoreUnresolvedActionPhasePrompts = true;
                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);
            });

            it('toHavePassableTriggerPrompt matches by ability text and by source card', function() {
                const { context } = contextRef;
                expect(context.player1).toHavePassableTriggerPrompt(abilityText);
                expect(context.player1).toHavePassableTriggerPrompt(context.ruggedSurvivors);
            });

            it('clickTrigger with no reference resolves the sole optional trigger', function() {
                const { context } = contextRef;
                context.player1.clickTrigger();
                expect(context.player1.hand.length).toBe(1);
            });

            it('clickPass with no reference declines the sole optional trigger', function() {
                const { context } = contextRef;
                context.player1.clickPass();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('clickTrigger resolves the trigger when referenced by its source card', function() {
                const { context } = contextRef;
                context.player1.clickTrigger(context.ruggedSurvivors);
                expect(context.player1.hand.length).toBe(1);
            });

            it('clickTrigger throws when the reference does not match the offered ability', function() {
                const { context } = contextRef;
                expect(() => context.player1.clickTrigger('Some other ability')).toThrowError(
                    /optional-trigger prompt for player1 to be for 'Some other ability'/
                );
            });

            it('toHaveExactTriggerResolutionPrompt does not match the standalone prompt', function() {
                const { context } = contextRef;
                expect(context.player1).not.toHaveExactTriggerResolutionPrompt([abilityText]);
            });
        });

        describe('with a simultaneous prompt of two optional same-source triggers, one with no effect (Anakin Skywalker)', function() {
            const heroismPrompt = 'If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase';
            const villainyPrompt = 'If there a Villainy card in your discard pile, you may give a unit -3/-3 for this phase';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#champion-of-mortis'],
                        // Heroism card in discard -> the Heroism trigger has an effect, the Villainy one does not.
                        discard: ['luke-skywalker#jedi-knight'],
                    },
                    player2: { groundArena: ['wampa'] }
                });

                const { context } = contextRef;
                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                context.ignoreUnresolvedActionPhasePrompts = true;
                context.player1.clickCard(context.anakinSkywalker);
            });

            it('toHaveExactTriggerResolutionPrompt captures optional / no-effect and is order-insensitive', function() {
                const { context } = contextRef;
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: heroismPrompt, optional: true },
                    { title: villainyPrompt, optional: true, hasEffect: false },
                ]);

                // The same descriptors in the opposite order still match.
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: villainyPrompt, optional: true, hasEffect: false },
                    { title: heroismPrompt, optional: true },
                ]);
            });

            it('toHaveExactTriggerResolutionPrompt fails when a descriptor flag is wrong', function() {
                const { context } = contextRef;
                // Wrong: the Villainy trigger has no effect here.
                expect(context.player1).not.toHaveExactTriggerResolutionPrompt([
                    { title: heroismPrompt, optional: true },
                    { title: villainyPrompt, optional: true },
                ]);
            });

            it('toHavePassableTriggerPrompt matches an optional trigger by ability text', function() {
                const { context } = contextRef;
                expect(context.player1).toHavePassableTriggerPrompt(heroismPrompt);
            });

            it('clickTrigger resolves the referenced ability by text', function() {
                const { context } = contextRef;
                context.player1.clickTrigger(heroismPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa]);
            });

            it('clickTrigger and clickPass throw without a reference (ambiguous among simultaneous triggers)', function() {
                const { context } = contextRef;
                expect(() => context.player1.clickTrigger()).toThrowError(
                    /clickTrigger requires a card or ability text when multiple triggers are being resolved at once/
                );
                expect(() => context.player1.clickPass()).toThrowError(
                    /clickPass requires a card or ability text when multiple triggers are being resolved at once/
                );
            });

            it('clickTrigger throws when a card reference matches multiple triggers', function() {
                const { context } = contextRef;
                // Both triggers come from Anakin, so a card reference is ambiguous.
                expect(() => context.player1.clickTrigger(context.anakinSkywalker)).toThrowError(
                    /matches 2 triggers; disambiguate with the ability text/
                );
            });

            it('clickTrigger throws when no trigger matches the reference', function() {
                const { context } = contextRef;
                expect(() => context.player1.clickTrigger('No such ability')).toThrowError(
                    /Couldn't find a trigger matching 'No such ability'/
                );
            });
        });

        describe('with a simultaneous prompt of a batched mandatory trigger and an optional trigger (Zeb + Advantage)', function() {
            const zebAbility = 'If the defender was defeated, you may deal 4 damage to a ground unit';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'zeb-orrelios#headstrong-warrior',
                            upgrades: ['advantage', 'advantage', 'advantage']
                        }]
                    },
                    player2: { groundArena: ['battlefield-marine'] }
                });

                // Zeb attacks and defeats Battlefield Marine, so its three Advantage "When Attack Ends"
                // triggers (grouped into one mandatory batch) share the window with Zeb's own optional ability.
                const { context } = contextRef;
                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                context.ignoreUnresolvedActionPhasePrompts = true;
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.battlefieldMarine);
            });

            it('toHaveExactTriggerResolutionPrompt reports the grouped count and the optional flag', function() {
                const { context } = contextRef;
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: 'Defeat Advantage token', count: 3 },
                    { title: zebAbility, optional: true },
                ]);
            });

            it('toHavePassableTriggerPrompt does not match a mandatory trigger', function() {
                const { context } = contextRef;
                expect(context.player1).not.toHavePassableTriggerPrompt('Defeat Advantage token');
            });

            it('clickPass throws when the referenced trigger is mandatory (not passable)', function() {
                const { context } = contextRef;
                expect(() => context.player1.clickPass('Defeat Advantage token')).toThrowError(
                    /Couldn't find a passable trigger matching 'Defeat Advantage token'/
                );
            });

            it('clickPass declines the optional trigger referenced by its source card', function() {
                const { context } = contextRef;
                context.player1.clickPass(context.zebOrrelios);
                // Only the mandatory Advantage batch remains to resolve.
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
            });
        });

        describe('when there is no triggered-ability prompt', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['battlefield-marine'] }
                });
            });

            it('clickTrigger and clickPass throw a clear error', function() {
                const { context } = contextRef;
                expect(() => context.player1.clickTrigger()).toThrowError(
                    /Expected player1 to have a triggered-ability prompt to trigger/
                );
                expect(() => context.player1.clickPass()).toThrowError(
                    /Expected player1 to have a triggered-ability prompt to pass/
                );
            });
        });

        describe('matcher argument guards', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['battlefield-marine'] }
                });
            });

            it('toHavePassableTriggerPrompt requires a reference', function() {
                const { context } = contextRef;
                expect(() => expect(context.player1).toHavePassableTriggerPrompt(null)).toThrowError(
                    /toHavePassableTriggerPrompt requires a card or ability text/
                );
            });

            it('toHaveExactTriggerResolutionPrompt requires an array', function() {
                const { context } = contextRef;
                expect(() => expect(context.player1).toHaveExactTriggerResolutionPrompt('not-an-array' as any)).toThrowError(
                    /is not an array/
                );
            });
        });
    });
});
