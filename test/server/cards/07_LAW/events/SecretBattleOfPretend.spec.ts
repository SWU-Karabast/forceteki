describe('Secret Battle Of Pretend', function() {
    integration(function(contextRef) {
        describe('Secret Battle Of Pretend\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['secret-battle-of-pretend'],
                        // luke-skywalker#jedi-knight has 2 aspects (Heroism, Vigilance)
                        // wampa has 1 aspect (Aggression)
                        groundArena: ['wampa', 'luke-skywalker#jedi-knight'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst', 'pyke-sentinel'],
                        spaceArena: ['cartel-spacer', 'tieln-fighter']
                    }
                });
            });

            it('should exhaust a friendly unit and then exhaust enemy units in the same arena based on aspect count', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.secretBattleOfPretend);

                // Should only be able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.lukeSkywalker, context.allianceXwing]);

                // Select Luke Skywalker (2 aspects: Heroism, Vigilance) - should exhaust 2 enemy ground units
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.lukeSkywalker.exhausted).toBeTrue();

                // Should be prompted to select 2 enemy units in the ground arena
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.pykeSentinel]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                context.player1.clickPrompt('Done');

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust a friendly unit with 1 aspect and exhaust 1 enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.secretBattleOfPretend);

                // Select Wampa (1 aspect: Aggression) - should exhaust 1 enemy ground unit
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeTrue();

                // Should be prompted to select 1 enemy unit in the ground arena
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.pykeSentinel]);

                context.player1.clickCard(context.battlefieldMarine);
                // When selecting exactly 1 target, it auto-completes

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should only target enemy units in the same arena (space)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.secretBattleOfPretend);

                // Select Alliance X-Wing (1 aspect: Heroism) - should exhaust 1 enemy space unit
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.exhausted).toBeTrue();

                // Should only be able to select enemy units in the space arena
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.tielnFighter]);

                context.player1.clickCard(context.cartelSpacer);
                // When selecting exactly 1 target, it auto-completes

                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.tielnFighter.exhausted).toBeFalse();
                // Ground units should not be affected
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not trigger the if you do effect when the friendly unit is already exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-battle-of-pretend'],
                    groundArena: [{ card: 'wampa', exhausted: true }, 'pyke-sentinel']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.secretBattleOfPretend);
            // Select the exhausted wampa
            context.player1.clickCard(context.wampa);

            // The unit was already exhausted, so "if you do" should not trigger
            // The pyke-sentinel (which is a valid target for the if you do) should not be affected
            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('should not allow selecting from other arena when there are no enemy units in the same arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-battle-of-pretend'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.secretBattleOfPretend);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.exhausted).toBeTrue();
            // No enemy units in ground arena, so the if you do resolves but has no targets
            expect(context.cartelSpacer.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('should trigger even if there are not enough enemy units to meet the requirement', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-battle-of-pretend'],
                    // luke-skywalker#jedi-knight has 2 aspects but there's only 1 enemy ground unit
                    groundArena: ['luke-skywalker#jedi-knight']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing', 'green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.secretBattleOfPretend);
            context.player1.clickCard(context.lukeSkywalker);

            expect(context.lukeSkywalker.exhausted).toBeTrue();

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
