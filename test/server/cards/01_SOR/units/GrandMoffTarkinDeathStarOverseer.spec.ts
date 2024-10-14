describe('Grand Moff Tarkin, Death Star Overseer', function() {
    integration(function(contextRef) {
        describe('Grand Moff Tarkin\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grand-moff-tarkin#death-star-overseer'],
                        deck: ['cell-block-guard', 'scout-bike-pursuer', 'academy-defense-walker', 'battlefield-marine', 'wampa', 'alliance-dispatcher', 'echo-base-defender', 'frontline-shuttle']
                    },
                    player2: {
                        hand: ['grand-moff-tarkin#death-star-overseer'],
                        deck: ['system-patrol-craft', 'clan-wren-rescuer', 'village-protectors', 'concord-dawn-interceptors', 'gentle-giant', 'frontier-atrt', 'cargo-juggernaut', 'public-enemy']
                    }
                });

                context.p1Tarkin = context.player1.findCardByName('grand-moff-tarkin#death-star-overseer');
                context.p2tarkin = context.player2.findCardByName('grand-moff-tarkin#death-star-overseer');
            });

            it('should prompt to choose up to 2 Imperials from the top 5 cards, reveal chosen, draw them, and put the rest on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.p1Tarkin);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveEnabledPromptButtons([context.academyDefenseWalker.title, context.cellBlockGuard.title, context.scoutBikePursuer.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.battlefieldMarine.title, context.wampa.title]);

                // Choose Cell Block Guard and Scout Bike Pursuer
                context.player1.clickPrompt(context.cellBlockGuard.title);
                context.player1.clickPrompt(context.scoutBikePursuer.title);
                expect(context.getChatLogs(2)).toContain('player1 takes Cell Block Guard and Scout Bike Pursuer');

                // Check cards in hand
                expect(context.cellBlockGuard).toBeInLocation('hand');
                expect(context.scoutBikePursuer).toBeInLocation('hand');

                // Check cards in deck
                expect(context.player1.deck.length).toBe(6);
                expect([context.academyDefenseWalker, context.battlefieldMarine, context.wampa]).toAllBeInBottomOfDeck(context.player1, 3);
            });

            it('should be allowed to pick just one card', function() {
                context.player1.clickCard(context.p1Tarkin);
                expect(context.player1).toHaveEnabledPromptButtons([context.academyDefenseWalker.title, context.cellBlockGuard.title, context.scoutBikePursuer.title]);
                expect(context.player1).toHaveDisabledPromptButtons([context.battlefieldMarine.title, context.wampa.title]);

                // Done prompt doesn't show up til one card selected
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt(context.cellBlockGuard.title);

                // Cell Block Guard and Take nothing should no longer be present
                expect(context.player1).toHaveEnabledPromptButtons([context.academyDefenseWalker.title, context.scoutBikePursuer.title]);
                expect(context.player1).not.toHaveEnabledPromptButton(context.cellBlockGuard.title);
                expect(context.player1).not.toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).not.toHaveDisabledPromptButton(context.cellBlockGuard.title);

                // Click Done
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Check card location and that player 2 now active
                expect(context.cellBlockGuard).toBeInLocation('hand');
                expect(context.player1.deck.length).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose no cards', function() {
                context.player1.clickCard(context.p1Tarkin);
                context.player1.clickPrompt('Take nothing');

                expect([context.academyDefenseWalker, context.battlefieldMarine, context.cellBlockGuard, context.scoutBikePursuer, context.wampa]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.player2).toBeActivePlayer();
            });

            it('no cards matching criteria', function() {
                context.player2.setActivePlayer();
                context.player2.clickCard(context.p2tarkin);
                expect(context.player2).toHaveDisabledPromptButtons([context.clanWrenRescuer.title, context.concordDawnInterceptors.title, context.gentleGiant.title, context.systemPatrolCraft.title, context.villageProtectors.title]);
                expect(context.player2).toHaveEnabledPromptButton('Take nothing');
                context.player2.clickPrompt('Take nothing');

                // Check that top 5 cards are now on the bottom of the deck
                expect([context.clanWrenRescuer, context.concordDawnInterceptors, context.gentleGiant, context.systemPatrolCraft, context.villageProtectors]).toAllBeInBottomOfDeck(context.player2, 5);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
