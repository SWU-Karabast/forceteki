describe('Talzin\'s Shuttle, Mysterious Arrival', function() {
    integration(function(contextRef) {
        describe('When Played ability', function() {
            it('should give 2 Weakness tokens to a unit if the opponent played 2 or more cards this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['talzins-shuttle#mysterious-arrival'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['porg', 'battlefield-marine'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.porg);
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.talzinsShuttleMysteriousArrival);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.porg, context.battlefieldMarine, context.talzinsShuttle]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if the opponent has played fewer than 2 cards this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'talzins-shuttle#mysterious-arrival'],
                    },
                    player2: {
                        hand: ['porg'],
                        spaceArena: ['awing'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player2.clickCard(context.porg);
                context.player1.clickCard(context.talzinsShuttle);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.porg).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.talzinsShuttle).toHaveExactUpgradeNames([]);
            });
        });
    });
});
