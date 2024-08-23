describe('Grand Moff Tarkin, Death Star Overseer', function() {
    integration(function() {
        describe('Grand Moff Tarkin\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grand-moff-tarkin#death-star-overseer'],
                        deck: ['cell-block-guard', 'scout-bike-pursuer', 'academy-defense-walker', 'battlefield-marine', 'wampa', 'alliance-dispatcher', 'echo-base-defender', 'frontline-shuttle'],
                        deckSize: 8,
                        leader: ['grand-moff-tarkin#oversector-governor']
                    },
                    player2: {
                        hand: ['grand-moff-tarkin#death-star-overseer'],
                        deck: ['system-patrol-craft', 'clan-wren-rescuer', 'village-protectors', 'concord-dawn-interceptors', 'gentle-giant', 'wampa', 'cargo-juggernaut', 'public-enemy'],
                        deckSize: 8,
                        leader: ['grand-moff-tarkin#oversector-governor']
                    }
                });

                this.tarkin = this.player1.findCardByName('grand-moff-tarkin#death-star-overseer');
                this.p2tarkin = this.player2.findCardByName('grand-moff-tarkin#death-star-overseer');

                this.academyDefenseWalker = this.player1.findCardByName('academy-defense-walker');
                this.cellBlockGuard = this.player1.findCardByName('cell-block-guard');
                this.scoutBikePursuer = this.player1.findCardByName('scout-bike-pursuer');

                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');
                this.wampa = this.player1.findCardByName('wampa');

                this.clanWrenRescuer = this.player2.findCardByName('clan-wren-rescuer');
                this.concordDawnInterceptors = this.player2.findCardByName('concord-dawn-interceptors');
                this.gentleGiant = this.player2.findCardByName('gentle-giant');
                this.systemPatrolCraft = this.player2.findCardByName('system-patrol-craft');
                this.villageProtectors = this.player2.findCardByName('village-protectors');

                this.noMoreActions();
            });

            it('should prompt to choose up to 2 Imperials from the top 5 cards', function () {
                this.player1.clickCard(this.tarkin);
                expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(this.player1).toHavePromptButton(this.academyDefenseWalker.title);
                expect(this.player1).toHavePromptButton(this.cellBlockGuard.title);
                expect(this.player1).toHavePromptButton(this.scoutBikePursuer.title);
                expect(this.player1).toHaveDisabledPromptButton(this.battlefieldMarine.title);
                expect(this.player1).toHaveDisabledPromptButton(this.wampa.title);
                expect(this.player1).toHavePromptButton('Take nothing');
            });

            it('should reveal the chosen Imperials', function() {
                this.player1.clickCard(this.tarkin);

                this.player1.clickPrompt(this.cellBlockGuard.title);
                this.player1.clickPrompt(this.scoutBikePursuer.title);
                expect(this.getChatLogs(2)).toContain('player1 takes Cell Block Guard and Scout Bike Pursuer');
            });

            it('should add the chosen cards to your hand', function() {
                this.player1.clickCard(this.tarkin);
                this.player1.clickPrompt(this.cellBlockGuard.title);
                this.player1.clickPrompt(this.scoutBikePursuer.title);
                expect(this.cellBlockGuard.location).toBe('hand');
                expect(this.scoutBikePursuer.location).toBe('hand');
            });

            it('should be allowed to pick just one card', function() {
                this.player1.clickCard(this.tarkin);

                // Done prompt doesn't show up til one card selected
                expect(this.player1).not.toHavePromptButton('Done');
                this.player1.clickPrompt(this.cellBlockGuard.title);

                // Click Done
                expect(this.player1).toHavePromptButton('Done');
                this.player1.clickPrompt('Done');

                expect(this.cellBlockGuard.location).toBe('hand');
                expect(this.player1.deck.length).toBe(7);
            });

            it('should be able to choose no cards', function() {
                this.player1.clickCard(this.tarkin);
                this.player1.clickPrompt('Take nothing');

                expect(this.academyDefenseWalker).toBeInBottomOfDeck(this.player1, 5);
                expect(this.battlefieldMarine).toBeInBottomOfDeck(this.player1, 5);
                expect(this.cellBlockGuard).toBeInBottomOfDeck(this.player1, 5);
                expect(this.scoutBikePursuer).toBeInBottomOfDeck(this.player1, 5);
                expect(this.wampa).toBeInBottomOfDeck(this.player1, 5);
            });

            it('no cards matching criteria', function() {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.p2tarkin);
                expect(this.player2).toHaveDisabledPromptButton(this.clanWrenRescuer.title);
                expect(this.player2).toHaveDisabledPromptButton(this.concordDawnInterceptors.title);
                expect(this.player2).toHaveDisabledPromptButton(this.gentleGiant.title);
                expect(this.player2).toHaveDisabledPromptButton(this.systemPatrolCraft.title);
                expect(this.player2).toHaveDisabledPromptButton(this.villageProtectors.title);
                expect(this.player2).toHavePromptButton('Take nothing');
                this.player2.clickPrompt('Take nothing');

                // Check that top 5 cards are now on the bottom of the deck
                expect(this.clanWrenRescuer).toBeInBottomOfDeck(this.player2, 5);
                expect(this.concordDawnInterceptors).toBeInBottomOfDeck(this.player2, 5);
                expect(this.gentleGiant).toBeInBottomOfDeck(this.player2, 5);
                expect(this.systemPatrolCraft).toBeInBottomOfDeck(this.player2, 5);
                expect(this.villageProtectors).toBeInBottomOfDeck(this.player2, 5);
            });

            it('should place the remaining cards on the bottom of the deck', function() {
                this.player1.clickCard(this.tarkin);
                this.player1.clickPrompt(this.academyDefenseWalker.title);
                this.player1.clickPrompt(this.cellBlockGuard.title);
                expect(this.player1.deck.length).toBe(6);

                expect(this.battlefieldMarine.location).toBe('deck');
                expect(this.scoutBikePursuer.location).toBe('deck');
                expect(this.wampa.location).toBe('deck');
            });
        });
    });
});
