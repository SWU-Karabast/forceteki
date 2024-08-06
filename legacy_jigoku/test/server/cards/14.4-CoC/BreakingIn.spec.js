describe('Breaking In', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['tattooed-wanderer'],
                    provinces: ['breaking-in'],
                    dynastyDiscard: ['mirumoto-raitsugu', 'favorable-ground', 'moto-chagatai']
                }
            });

            this.brashSamurai = this.player1.findCardByName('brash-samurai');
            this.dojiWhisperer = this.player1.findCardByName('doji-whisperer');

            this.tattooedWanderer = this.player2.findCardByName('tattooed-wanderer');
            this.breaking = this.player2.findCardByName('breaking-in');
            this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 2');
            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.chagatai = this.player2.findCardByName('moto-chagatai');
            this.player2.moveCard(this.mirumotoRaitsugu, 'dynasty deck');
            this.favorableGround = this.player2.findCardByName('favorable-ground');
            this.player2.moveCard(this.favorableGround, 'dynasty deck');
            this.player2.moveCard(this.chagatai, 'dynasty deck');
        });

        it('should trigger when revealed', function() {
            this.noMoreActions();
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.breaking);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.breaking);
        });

        it('should prompt to choose a character', function() {
            this.noMoreActions();
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.breaking);
            this.player1.clickPrompt('Initiate Conflict');
            this.player2.clickCard(this.breaking);
            expect(this.getChatLogs(1)).toContain('player2 uses Breaking In to choose a character to place in a province');
            expect(this.player2).toHavePrompt('Select a card:');
            expect(this.player2).toHavePromptButton('Adept of the Waves (4)');
            expect(this.player2).toHavePromptButton('Mirumoto Raitsugu');
            expect(this.player2).toHavePromptButton('Moto Chagatai');
            expect(this.player2).not.toHavePromptButton('Imperial Storehouse');
            expect(this.player2).toHavePromptButton('Select nothing');
        });

        it('should do nothing if \'Select nothing\' is chosen', function() {
            let dynastyDeckSize = this.player2.dynastyDeck.length;
            this.noMoreActions();
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.breaking);
            this.player1.clickPrompt('Initiate Conflict');
            this.player2.clickCard(this.breaking);
            this.player2.clickPrompt('Select nothing');
            expect(this.player2.dynastyDeck.length).toBe(dynastyDeckSize);
            expect(this.getChatLogs(2)).toContain('player2 selects nothing from their deck');
        });

        it('if Cavalry, should let you pick the province', function() {
            this.noMoreActions();
            const cardsInDiscard = this.player2.player.dynastyDiscardPile.size();
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.breaking);
            this.player1.clickPrompt('Initiate Conflict');
            this.player2.clickCard(this.breaking);
            this.player2.clickPrompt('Moto Chagatai');
            expect(this.player2).toHavePrompt('Choose a province');
            this.player2.clickCard(this.shamefulDisplay);
            expect(this.chagatai.location).toBe('province 2');
            expect(this.chagatai.facedown).toBe(false);
            expect(this.player2.player.dynastyDiscardPile.size()).toBe(cardsInDiscard);
            expect(this.getChatLogs(3)).toContain('player2 places Moto Chagatai in province 2');
            expect(this.getChatLogs(3)).toContain('player2 is shuffling their dynasty deck');
        });

        it('if not Cavalry, should not let you pick the province', function() {
            this.noMoreActions();
            const cardsInDiscard = this.player2.player.dynastyDiscardPile.size();
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.breaking);
            this.player1.clickPrompt('Initiate Conflict');
            this.player2.clickCard(this.breaking);
            this.player2.clickPrompt('Mirumoto Raitsugu');
            expect(this.mirumotoRaitsugu.location).toBe('province 1');
            expect(this.mirumotoRaitsugu.facedown).toBe(false);
            expect(this.player2.player.dynastyDiscardPile.size()).toBe(cardsInDiscard);
            expect(this.getChatLogs(3)).toContain('player2 places Mirumoto Raitsugu in Breaking In');
            expect(this.getChatLogs(3)).toContain('player2 is shuffling their dynasty deck');
        });
    });
});
