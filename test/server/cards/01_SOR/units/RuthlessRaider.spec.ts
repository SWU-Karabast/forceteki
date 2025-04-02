describe('Ruthless Raider', function() {
    integration(function(contextRef) {
        describe('Ruthless Raider\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['inferno-four#unforgetting', 'system-patrol-craft'],
                        hand: ['ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['wampa'],
                        hand: ['rivals-fall']
                    }
                });
            });

            it('should deal 2 damage to an enemy unit and enemy base.', function () {
                const { context } = contextRef;

                // Play Ruthless Raider from hand
                context.player1.clickCard(context.ruthlessRaider);

                // Select Enemy Unit and Base. Not able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);

                // Checking When Defeated
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ruthlessRaider);

                // Select Enemy Unit and Base. Not able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(4);
                expect(context.greenSquadronAwing).toBeInZone('discard');
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['ruthless-raider']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['maul#shadow-collective-visionary'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.ruthlessRaider);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
            context.player2.clickCard(context.wampa);
            expect(context.ruthlessRaider).toBeInZone('discard', context.player1);

            context.player1.passAction();
        });
    });
});
