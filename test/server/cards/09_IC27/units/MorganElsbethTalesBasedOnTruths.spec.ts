describe('Morgan Elsbeth, Tales Based on Truths', function() {
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            it('reveals and draws the top card of your deck when it costs 6 or more', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['morgan-elsbeth#tales-based-on-truths'],
                        deck: ['avenger#hunting-star-destroyer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                // Opponent is shown the revealed card and acknowledges the display prompt
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.avenger]);
                context.player2.clickDone();

                expect(context.player1.hand).toContain(context.avenger);
                expect(context.avenger).toBeInZone('hand');
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('reveals and discards the top card of your deck when it costs less than 6', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['morgan-elsbeth#tales-based-on-truths'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                // Opponent is shown the revealed card and acknowledges the display prompt
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
                context.player2.clickDone();

                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.hand).not.toContain(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing when your deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['morgan-elsbeth#tales-based-on-truths'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.handSize).toBe(0);
                expect(context.player1.discard.length).toBe(0);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
