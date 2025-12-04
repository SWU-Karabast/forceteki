describe('Zeb Orellios, Spectre Four', function () {
    integration(function (contextRef) {
        describe('Zeb Orellios\'s ability', function () {
            it('deals 3 damage to a ground unit if you control no Command/Cunning unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orellios#spectre-four']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrellios);

                // Only ground units should be targetable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.zebOrellios]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                // Should deal 3 damage by default
                expect(context.wampa.damage).toBe(3);
            });

            it('deals 5 damage if you control a Command unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orellios#spectre-four'],
                        spaceArena: ['diplomatic-envoy'] // Command aspect unit
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrellios);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);
            });

            it('deals 5 damage if you control a Cunning unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orellios#spectre-four'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrellios);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);
            });
        });
    });
});
