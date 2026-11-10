describe('Third Sister, Reckless', function() {
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            it('deals 1 damage to a friendly ground unit and 1 damage to an enemy ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['third-sister#reckless', 'battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to a friendly ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.thirdSister, context.battlefieldMarine]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.awing.damage).toBe(0);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('still damages the enemy unit when there is no other friendly ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['third-sister#reckless']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);

                // Third Sister must hit herself — she is the only friendly ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.thirdSister]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.wampa);

                expect(context.thirdSister.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('still targets a friendly ground unit when there is no enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['third-sister#reckless', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);

                // The friendly part still resolves normally
                expect(context.player1).toHavePrompt('Deal 1 damage to a friendly ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.thirdSister, context.battlefieldMarine]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                // No enemy target — the enemy part resolves with nothing
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
