/**
 * Meta-tests for the trigger-prompt test harness itself: clickTrigger / clickPass and the
 * toHavePassableTriggerPrompt / toHaveExactTriggerResolutionPrompt matchers. These pin the behavior we
 * rely on across the suite — shape-agnostic dispatch (standalone optional prompt vs. simultaneous
 * resolution prompt), reference matching by ability text (with an optional source card to disambiguate),
 * and the error messaging for every throwing scenario — so regressions in the helpers surface here instead
 * of silently elsewhere.
 *
 * Each test performs the action that opens its trigger prompt itself rather than in `beforeEach`: undo-mode
 * runs roll back to the start of the last action and replay the test body, so a prompt opened in
 * `beforeEach` would not be reached on the replay.
 */
describe('Trigger-prompt test helpers', function() {
    /**
     * Predicate for `toThrowMatching`: the error message contains every given line. Used to pin the prompt
     * dump appended to helper errors without also pinning its blank-line padding.
     */
    function messageContainsLines(...lines: string[]) {
        return (error: Error) => lines.every((line) => error.message.includes(line));
    }

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

                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                contextRef.context.ignoreUnresolvedActionPhasePrompts = true;
            });

            // Attacking triggers Rugged Survivors' sole optional "On Attack" ability, which (with a
            // deployed leader in play) has a legal effect and so shows the standalone optional prompt.
            function attackWithRuggedSurvivors() {
                const { context } = contextRef;
                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);
            }

            it('toHavePassableTriggerPrompt matches by ability text, optionally checking the source card', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                expect(context.player1).toHavePassableTriggerPrompt(abilityText);
                expect(context.player1).toHavePassableTriggerPrompt(abilityText, context.ruggedSurvivors);
                expect(context.player1).not.toHavePassableTriggerPrompt(abilityText, context.p1Leader);
            });

            it('clickTrigger with no reference resolves the sole optional trigger', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                context.player1.clickTrigger();
                expect(context.player1.hand.length).toBe(1);
            });

            it('clickPass with no reference declines the sole optional trigger', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                context.player1.clickPass();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('clickTrigger resolves the trigger when referenced by its text and source card', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                context.player1.clickTrigger(abilityText, context.ruggedSurvivors);
                expect(context.player1.hand.length).toBe(1);
            });

            it('clickTrigger throws when the reference does not match the offered ability', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                expect(() => context.player1.clickTrigger('Some other ability')).toThrowError(
                    /optional-trigger prompt for player1 to be for 'Some other ability'/
                );
            });

            it('clickTrigger throws when the source card does not match, and the prompt dump names the ability and its source', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
                expect(() => context.player1.clickTrigger(abilityText, context.p1Leader)).toThrowMatching(messageContainsLines(
                    'Expected the optional-trigger prompt for player1 to be for \'Draw a card if you control a leader unit\' from Chirrut Îmwe, but it was not.',
                    'You may trigger this ability: Draw a card if you control a leader unit (Rugged Survivors)',
                    '[ Trigger ]',
                    '[ Pass ]'
                ));
            });

            it('toHaveExactTriggerResolutionPrompt does not match the standalone prompt', function() {
                const { context } = contextRef;
                attackWithRuggedSurvivors();
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

                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                contextRef.context.ignoreUnresolvedActionPhasePrompts = true;
            });

            function playAnakin() {
                const { context } = contextRef;
                context.player1.clickCard(context.anakinSkywalker);
            }

            it('toHaveExactTriggerResolutionPrompt captures optional / no-effect and is order-insensitive', function() {
                const { context } = contextRef;
                playAnakin();
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
                playAnakin();
                // Wrong: the Villainy trigger has no effect here.
                expect(context.player1).not.toHaveExactTriggerResolutionPrompt([
                    { title: heroismPrompt, optional: true },
                    { title: villainyPrompt, optional: true },
                ]);
            });

            it('toHavePassableTriggerPrompt matches an optional trigger by ability text', function() {
                const { context } = contextRef;
                playAnakin();
                expect(context.player1).toHavePassableTriggerPrompt(heroismPrompt);
            });

            it('clickTrigger resolves the referenced ability by text', function() {
                const { context } = contextRef;
                playAnakin();
                context.player1.clickTrigger(heroismPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa]);
            });

            it('clickTrigger accepts the source card alongside the ability text', function() {
                const { context } = contextRef;
                playAnakin();
                context.player1.clickTrigger(heroismPrompt, context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa]);
            });

            it('clickTrigger and clickPass throw without the ability text (ambiguous among simultaneous triggers)', function() {
                const { context } = contextRef;
                playAnakin();
                expect(() => context.player1.clickTrigger()).toThrowError(
                    /clickTrigger requires the ability text when multiple triggers are being resolved at once/
                );
                expect(() => context.player1.clickPass()).toThrowError(
                    /clickPass requires the ability text when multiple triggers are being resolved at once/
                );
            });

            it('clickTrigger and clickPass reject a card in place of the ability text', function() {
                const { context } = contextRef;
                playAnakin();
                // A source card alone can't tell Anakin's two triggers apart (or detect an unexpected extra ability).
                expect(() => context.player1.clickTrigger(context.anakinSkywalker)).toThrowError(
                    'clickTrigger expects the ability text as its first argument; to disambiguate by card, pass the source card second: clickTrigger(\'<ability text>\', card)'
                );
                expect(() => context.player1.clickPass(context.anakinSkywalker)).toThrowError(
                    'clickPass expects the ability text as its first argument; to disambiguate by card, pass the source card second: clickPass(\'<ability text>\', card)'
                );
            });

            it('clickTrigger throws when given a source card without the ability text', function() {
                const { context } = contextRef;
                playAnakin();
                expect(() => context.player1.clickTrigger(undefined, context.anakinSkywalker)).toThrowError(
                    'clickTrigger requires the ability text when a source card is given: clickTrigger(\'<ability text>\', card)'
                );
            });

            it('clickTrigger throws when the ability text matches but the source card does not', function() {
                const { context } = contextRef;
                playAnakin();
                expect(() => context.player1.clickTrigger(heroismPrompt, context.wampa)).toThrowError(
                    /Couldn't find a trigger matching 'If there a Heroism card in your discard pile, .*' from Wampa/
                );
            });

            it('clickTrigger throws when no trigger matches, and the prompt dump shows each trigger with its pass button and source', function() {
                const { context } = contextRef;
                playAnakin();
                expect(() => context.player1.clickTrigger('No such ability')).toThrowMatching(messageContainsLines(
                    'Couldn\'t find a trigger matching \'No such ability\' for player1.',
                    `[ ${heroismPrompt} ] [ Pass ] (Anakin Skywalker)`,
                    `[ ${villainyPrompt} ] [ Pass ] (Anakin Skywalker)`
                ));
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

                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                contextRef.context.ignoreUnresolvedActionPhasePrompts = true;
            });

            // Zeb attacks and defeats Battlefield Marine, so its three Advantage "When Attack Ends"
            // triggers (grouped into one mandatory batch) share the window with Zeb's own optional ability.
            function attackWithZeb() {
                const { context } = contextRef;
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.battlefieldMarine);
            }

            it('toHaveExactTriggerResolutionPrompt reports the grouped count and the optional flag', function() {
                const { context } = contextRef;
                attackWithZeb();
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: 'Defeat Advantage token', count: 3 },
                    { title: zebAbility, optional: true },
                ]);
            });

            it('toHavePassableTriggerPrompt does not match a mandatory trigger', function() {
                const { context } = contextRef;
                attackWithZeb();
                expect(context.player1).not.toHavePassableTriggerPrompt('Defeat Advantage token');
            });

            it('clickPass throws when the referenced trigger is mandatory, and the prompt dump shows no pass button for it', function() {
                const { context } = contextRef;
                attackWithZeb();
                expect(() => context.player1.clickPass('Defeat Advantage token')).toThrowMatching(messageContainsLines(
                    'Couldn\'t find a passable trigger matching \'Defeat Advantage token\' for player1.',
                    `[ ${zebAbility} ] [ Pass ] (Zeb Orrelios)`,
                    '[ Defeat Advantage token ] (Advantage)'
                ));
            });

            it('clickPass declines the optional trigger referenced by its text and source card', function() {
                const { context } = contextRef;
                attackWithZeb();
                context.player1.clickPass(zebAbility, context.zebOrrelios);
                // Only the mandatory Advantage batch remains to resolve.
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
            });
        });

        describe('with a simultaneous prompt of same-text triggers from different source cards (three "Draw a card" When Defeated abilities)', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['superlaser-blast'],
                        groundArena: ['nightsister-warrior', 'ant-droid'],
                        spaceArena: ['landing-shuttle']
                    }
                });

                // These meta-tests intentionally assert on (and leave) prompts mid-resolution.
                contextRef.context.ignoreUnresolvedActionPhasePrompts = true;
            });

            // Superlaser Blast defeats all three units at once. Each has a "Draw a card" When Defeated
            // ability (Landing Shuttle's is optional); different source cards keep them from being grouped.
            function playSuperlaserBlast() {
                const { context } = contextRef;
                context.player1.clickCard(context.superlaserBlast);
            }

            it('toHaveExactTriggerResolutionPrompt matches each entry to its source card', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: 'Draw a card', source: context.nightsisterWarrior },
                    { title: 'Draw a card', source: context.antDroid },
                    { title: 'Draw a card', optional: true, source: context.landingShuttle },
                ]);
            });

            it('toHaveExactTriggerResolutionPrompt lets entries without a source match any source card', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    'Draw a card',
                    { title: 'Draw a card', source: context.antDroid },
                    { title: 'Draw a card', optional: true },
                ]);
            });

            it('toHaveExactTriggerResolutionPrompt fails when an entry names the wrong source card', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                // The optional trigger comes from Landing Shuttle, not Nightsister Warrior.
                expect(context.player1).not.toHaveExactTriggerResolutionPrompt([
                    'Draw a card',
                    'Draw a card',
                    { title: 'Draw a card', optional: true, source: context.nightsisterWarrior },
                ]);
            });

            it('toHaveExactTriggerResolutionPrompt throws when an entry\'s source is not a card', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(() => expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    'Draw a card',
                    'Draw a card',
                    { title: 'Draw a card', optional: true, source: 'landing-shuttle' as any },
                ])).toThrowError('Invalid trigger descriptor for \'Draw a card\': \'source\' must be a card');
            });

            it('clickTrigger throws when the ability text matches several triggers and no source card is given', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(() => context.player1.clickTrigger('Draw a card')).toThrowMatching(messageContainsLines(
                    '\'Draw a card\' matches 3 triggers for player1; pass the source card as the second argument to disambiguate.',
                    '[ Draw a card ] (Nightsister Warrior)',
                    '[ Draw a card ] (Ant Droid)',
                    '[ Draw a card ] [ Pass ] (Landing Shuttle)'
                ));
            });

            it('clickTrigger resolves the trigger from the given source card', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                context.player1.clickTrigger('Draw a card', context.antDroid);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: 'Draw a card', source: context.nightsisterWarrior },
                    { title: 'Draw a card', optional: true, source: context.landingShuttle },
                ]);
            });

            it('clickPass needs no source card when only one trigger with that text is passable', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                context.player1.clickPass('Draw a card');
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: 'Draw a card', source: context.nightsisterWarrior },
                    { title: 'Draw a card', source: context.antDroid },
                ]);
            });

            it('toHavePassableTriggerPrompt checks the source card when given', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(context.player1).toHavePassableTriggerPrompt('Draw a card', context.landingShuttle);
                expect(context.player1).not.toHavePassableTriggerPrompt('Draw a card', context.nightsisterWarrior);
            });

            it('clickPass throws when the trigger from the given source card is mandatory', function() {
                const { context } = contextRef;
                playSuperlaserBlast();
                expect(() => context.player1.clickPass('Draw a card', context.nightsisterWarrior)).toThrowError(
                    /Couldn't find a passable trigger matching 'Draw a card' from Nightsister Warrior/
                );
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

            it('toHavePassableTriggerPrompt requires the ability text as its first parameter', function() {
                const { context } = contextRef;
                const expectedError = 'toHavePassableTriggerPrompt expects the ability text as its first parameter; to disambiguate by card, pass the source card second: toHavePassableTriggerPrompt(\'<ability text>\', card)';
                expect(() => expect(context.player1).toHavePassableTriggerPrompt(null)).toThrowError(expectedError);
                expect(() => expect(context.player1).toHavePassableTriggerPrompt(context.battlefieldMarine)).toThrowError(expectedError);
            });

            it('toHaveExactTriggerResolutionPrompt requires an array', function() {
                const { context } = contextRef;
                expect(() => expect(context.player1).toHaveExactTriggerResolutionPrompt('not-an-array' as any)).toThrowError(
                    'Parameter \'expectedEntries\' is not an array: not-an-array'
                );
            });
        });
    });
});
