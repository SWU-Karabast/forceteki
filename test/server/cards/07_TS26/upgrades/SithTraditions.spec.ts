describe('Sith Traditions', function() {
    integration(function(contextRef) {
        describe('Sith Traditions\'s abilities', function() {
            it('gives an Experience token to the attached unit when it attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['sith-traditions'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                expect(context.battlefieldMarine.upgrades.length).toBe(1);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['sith-traditions', 'experience']);
            });

            it('gives an Experience token to a friendly unit when the attached unit is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['sith-traditions'] }, 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Give an Experience token to a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).toBeActivePlayer();
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['experience']);
            });

            it('gives an Experience token to a friendly unit when the attached unit is defeated (No Glory Only Results)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['sith-traditions'] }]
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
