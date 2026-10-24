describe('Intelligence Agency', function () {
    integration(function (contextRef) {
        describe('Intelligence Agency\'s constant ability', function () {
            it('allows its controller to see the top card of their deck while attached to a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'kestro-city', upgrades: ['intelligence-agency'] },
                        deck: ['vanquish']
                    },
                    player2: {
                        deck: ['overwhelming-barrage']
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toSeeTopCardOfDeck();
                expect(context.player1).not.toSeeTopCardOfDeck(context.player2);
                expect(context.player2).not.toSeeTopCardOfDeck();
            });
        });

        describe('Intelligence Agency\'s when played ability', function () {
            it('looks at the opponent\'s hand, may discard a card, and the opponent draws a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['intelligence-agency'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.intelligenceAgency);
                context.player1.clickCard(context.p1Base);

                expect(context.getChatLogs(1)[0]).toContain(context.atst.title);
                expect(context.getChatLogs(1)[0]).toContain(context.waylay.title);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.waylay]);

                context.player1.clickCardInDisplayCardPrompt(context.waylay);

                expect(context.waylay).toBeInZone('discard');
                expect(context.wampa).toBeInZone('hand');
                expect(context.atst).toBeInZone('hand');
                expect(context.player2.hand.length).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('can choose to discard nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['intelligence-agency'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.intelligenceAgency);
                context.player1.clickCard(context.p1Base);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.player2.hand.length).toBe(2);
                expect(context.player2.discard.length).toBe(0);
                expect(context.wampa).toBeInZone('deck');
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if the opponent has no cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['intelligence-agency']
                    },
                    player2: {
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.intelligenceAgency);
                context.player1.clickCard(context.p1Base);

                expect(context.getChatLogs(1)[0]).toContain('player1 plays Intelligence Agency');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
