describe('Mas Amedda, Vice Chair', function() {
    integration(function(contextRef) {
        describe('Mas Amedda\'s Ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['mas-amedda#vice-chair'],
                        hand: ['frontier-atrt'],
                        deck: ['system-patrol-craft', 'clan-wren-rescuer', 'concord-dawn-interceptors', 'bounty-posting', 'gentle-giant', 'cargo-juggernaut']
                    },
                    player2: {
                        groundArena: ['mas-amedda#vice-chair'],
                        hand: ['superlaser-technician'],
                        deck: ['price-on-your-head', 'merciless-contest', 'overwhelming-barrage', 'public-enemy', 'gentle-giant', 'cargo-juggernaut',]
                    }
                });
           });

            it('should prompt to choose up to 1 unit from the top 4 cards, reveal chosen, draw it, and put the rest on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt)
                expect(context.player1).toHavePrompt('Trigger the ability \'Exhaust this unit\' or pass');
                expect(context.player1).toHaveEnabledPromptButton('Exhaust this unit');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Exhaust this unit');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer, context.concordDawnInterceptors],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.systemPatrolCraft);

                expect(context.getChatLogs(2)).toContain('player1 takes System Patrol Craft');

                // Check cards in hand
                expect(context.systemPatrolCraft).toBeInZone('hand');

                // Check cards in deck
                expect(context.player1.deck.length).toBe(5);
                expect([context.clanWrenRescuer, context.concordDawnInterceptors, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 3);
            });

            it('should be able to choose no cards', function() {
                const { context } = contextRef;
                
                context.player1.clickCard(context.frontierAtrt)
                expect(context.player1).toHavePrompt('Trigger the ability \'Exhaust this unit\' or pass');
                expect(context.player1).toHaveEnabledPromptButton('Exhaust this unit');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Exhaust this unit');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer, context.concordDawnInterceptors],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
 
                expect([context.systemPatrolCraft, context.clanWrenRescuer, context.concordDawnInterceptors, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 4);                
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to not activate ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt)
                expect(context.player1).toHavePrompt('Trigger the ability \'Exhaust this unit\' or pass');
                expect(context.player1).toHaveEnabledPromptButton('Exhaust this unit');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Pass');            

                expect(context.player2).toBeActivePlayer();
            })
                

            it('no cards matching criteria', function() {
                const { context } = contextRef;

                context.player2.setActivePlayer();

                context.player2.clickCard(context.superlaserTechnician);
                expect(context.player2).toHavePrompt('Trigger the ability \'Exhaust this unit\' or pass');
                expect(context.player2).toHaveEnabledPromptButton('Exhaust this unit');
                expect(context.player2).toHaveEnabledPromptButton('Pass');

                context.player2.clickPrompt('Exhaust this unit');            

                expect(context.player2).toHaveExactDisplayPromptCards({
                    invalid: [context.priceOnYourHead, context.mercilessContest, context.overwhelmingBarrage, context.publicEnemy]
                });
                expect(context.player2).toHaveEnabledPromptButton('Take nothing');

                context.player2.clickPrompt('Take nothing');
 
                // Check that top 5 cards are now on the bottom of the deck
                expect([context.priceOnYourHead, context.mercilessContest, context.overwhelmingBarrage, context.publicEnemy]).toAllBeInBottomOfDeck(context.player2, 4);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
