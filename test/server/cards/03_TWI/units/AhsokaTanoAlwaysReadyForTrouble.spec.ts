describe('Ahsoka Tano Always Ready For Trouble', function () {
    integration(function (contextRef) {
        describe('Ahsoka Tano\'s ability', function () {
            it('should trigger ambush as control less units than opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ahsoka-tano#always-ready-for-trouble']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper', 'first-legion-snowtrooper'],
                    }
                });
                const { context } = contextRef;

                // Trigger Ambush
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player2.passAction();

                // action return to hand
                context.player1.clickCard(context.ahsokaTano);
                context.player2.passAction();

                // Doesnt trigger Ambush
                context.player1.clickCard(context.ahsokaTano);
                expect(context.ahsokaTano).toBeInZone('groundArena');
            });

            it('should cost 2 resources and return Ahsoka and upgrades to owners hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'ahsoka-tano#always-ready-for-trouble', upgrades: ['generals-blade'] }]
                    },
                    player2: {
                        hand: ['resilient']
                    }
                });

                const { context } = contextRef;

                // Returns all to hand
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickPrompt('Return to hand');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.generalsBlade).toBeInZone('hand');
                expect(context.ahsokaTano).toBeInZone('hand');
                context.player2.passAction();

                // setup for upgrade to both hands.
                context.player1.clickCard(context.ahsokaTano);
                context.player2.clickCard(context.resilient);
                context.player2.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.generalsBlade);
                context.player1.clickCard(context.ahsokaTano);
                context.player2.passAction();

                // returns upgrades to owners hand
                context.player1.clickCard(context.ahsokaTano);
                expect(context.generalsBlade).toBeInZone('hand');
                expect(context.ahsokaTano).toBeInZone('hand');
                expect(context.resilient).toBeInZone('hand', context.player2);
            });
        });
    });
});
