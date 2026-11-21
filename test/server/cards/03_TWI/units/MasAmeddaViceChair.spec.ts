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
                        deck: ['price-on-your-head', 'merciless-contest', 'overwhelming-barrage', 'public-enemy', 'gentle-giant', 'cargo-juggernaut']
                    }
                });
            });

            it('should prompt to choose up to 1 unit from the top 4 cards, reveal chosen, draw it, and put the rest on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                expect(context.player1).toHaveEnabledPromptButton('Trigger');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer, context.concordDawnInterceptors],
                    invalid: [context.bountyPosting]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.systemPatrolCraft);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.systemPatrolCraft]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Mas Amedda to reveal and draw System Patrol Craft');

                // Check cards in hand
                expect(context.systemPatrolCraft).toBeInZone('hand');

                // Check cards in deck
                expect(context.player1.deck.length).toBe(5);
                expect([context.clanWrenRescuer, context.concordDawnInterceptors, context.bountyPosting]).toAllBeInBottomOfDeck(context.player1, 3);
            });

            it('should be able to choose no cards', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                expect(context.player1).toHaveEnabledPromptButton('Trigger');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Trigger');

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

                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                expect(context.player1).toHaveEnabledPromptButton('Trigger');
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });


            it('no cards matching criteria', function() {
                const { context } = contextRef;

                context.player2.setActivePlayer();

                context.player2.clickCard(context.superlaserTechnician);
                expect(context.player2).toHavePassAbilityPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                expect(context.player2).toHaveEnabledPromptButton('Trigger');
                expect(context.player2).toHaveEnabledPromptButton('Pass');

                context.player2.clickPrompt('Trigger');

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

        describe('Mas Amedda\'s Ability with a unit owned by the opponent', function() {
            it('should trigger only for the player who plays the opponent\'s unit from their discard pile, not for its owner', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['mas-amedda#vice-chair'],
                        hand: ['takedown'],
                        deck: ['system-patrol-craft', 'bounty-posting', 'clan-wren-rescuer', 'concord-dawn-interceptors', 'gentle-giant']
                    },
                    player2: {
                        groundArena: ['mas-amedda#vice-chair'],
                        spaceArena: ['stolen-athauler'],
                        deck: ['price-on-your-head', 'merciless-contest', 'overwhelming-barrage', 'public-enemy', 'cargo-juggernaut']
                    }
                });

                const { context } = contextRef;

                const p1MasAmedda = context.player1.findCardByName('mas-amedda#vice-chair');
                const p2MasAmedda = context.player2.findCardByName('mas-amedda#vice-chair');

                // defeat the opponent's Stolen AT-Hauler, its When Defeated lets player1 play it from player2's discard pile
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('discard', context.player2);

                context.player2.passAction();

                // play the Stolen AT-Hauler owned by player2
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.systemPatrolCraft, context.clanWrenRescuer, context.concordDawnInterceptors],
                    invalid: [context.bountyPosting]
                });
                context.player1.clickCardInDisplayCardPrompt(context.systemPatrolCraft);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.systemPatrolCraft]);
                context.player2.clickDone();

                expect(context.systemPatrolCraft).toBeInZone('hand', context.player1);
                expect(p1MasAmedda.exhausted).toBeTrue();

                // the owner's Mas Amedda did not trigger
                expect(p2MasAmedda.exhausted).toBeFalse();
                expect(context.player2.handSize).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
