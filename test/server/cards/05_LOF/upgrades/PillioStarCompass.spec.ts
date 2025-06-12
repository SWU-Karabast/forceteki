describe('Pillio Star Compass', function() {
    integration(function(contextRef) {
        describe('Pillio Star Compass\'s Ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['mas-amedda#vice-chair'],
                        hand: ['pillio-star-compass'],
                        deck: ['system-patrol-craft', 'clan-wren-rescuer', 'bounty-posting', 'overwhelming-barrage', 'public-enemy', 'price-on-your-head']
                    },
                    player2: {
                        hand: ['disabling-fang-fighter'],
                        groundArena: ['ryloth-militia'],
                        spaceArena: ['inferno-four#unforgetting'],
                    }
                });
            });

            it('should prompt to choose up to 1 unit from the top 3 cards, reveal chosen, draw it, and put the rest on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pillioStarCompass);
                expect(context.player1).toBeAbleToSelectExactly([context.masAmeddaViceChair, context.rylothMilitia]);
                context.player1.clickCard(context.masAmeddaViceChair);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.systemPatrolCraft);

                expect(context.getChatLogs(2)).toContain('player1 takes System Patrol Craft');

                // Check cards in hand
                expect(context.systemPatrolCraft).toBeInZone('hand');

                // Check cards in deck
                expect(context.player1.deck.length).toBe(5);
                expect([context.clanWrenRescuer, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 2);
            });

            it('should be able to choose no cards', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.pillioStarCompass);
                expect(context.player1).toBeAbleToSelectExactly([context.masAmeddaViceChair, context.rylothMilitia]);
                context.player1.clickCard(context.masAmeddaViceChair);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect([context.systemPatrolCraft, context.clanWrenRescuer, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 3);
                expect(context.player2).toBeActivePlayer();
            });

            it('no cards matching criteria', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.pillioStarCompass);
                expect(context.player1).toBeAbleToSelectExactly([context.masAmeddaViceChair, context.rylothMilitia]);
                context.player1.clickCard(context.masAmeddaViceChair);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect([context.systemPatrolCraft, context.clanWrenRescuer, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 3);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.pillioStarCompass);

                context.player1.moveCard(context.pillioStarCompass, 'hand');

                context.player1.clickCard(context.pillioStarCompass);
                expect(context.player1).toBeAbleToSelectExactly([context.masAmeddaViceChair, context.rylothMilitia]);
                context.player1.clickCard(context.rylothMilitia);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.priceOnYourHead, context.publicEnemy, context.overwhelmingBarrage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect([context.priceOnYourHead, context.publicEnemy, context.overwhelmingBarrage]).toAllBeInBottomOfDeck(context.player1, 3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});