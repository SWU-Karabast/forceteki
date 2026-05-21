describe('Targeted For Removal', function () {
    integration(function (contextRef) {
        describe('When defeated', function () {
            it('opponent creates credit tokens equals to attached unit cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['targeted-for-removal'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Defeat Battlefield Marine
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);

                // Targeted For Removal ability should trigger, creating Credit tokens equal to Battlefield Marine's cost (2)
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(0);
            });

            it('opponent creates credit tokens equals to attached space unit cost using No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results']
                    },
                    player2: {
                        spaceArena: [
                            { card: 'tieln-fighter', upgrades: ['targeted-for-removal'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Defeat Tieln Fighter
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.tielnFighter);

                // Targeted For Removal ability should trigger, creating Credit tokens equal to Tieln Fighter's cost (1)
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(1);
            });

            it('opponent should not create credit tokens when unit is returned to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['waylay']
                    },
                    player2: {
                        spaceArena: [
                            { card: 'tieln-fighter', upgrades: ['targeted-for-removal'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Return Tieln Fighter to hand
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.tielnFighter);

                // Targeted For Removal ability should not trigger, no Credit tokens should be created
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(0);
            });
        });
    });
});