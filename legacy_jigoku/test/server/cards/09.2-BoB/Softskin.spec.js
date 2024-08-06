describe('Softskin', function() {
    integration(function() {
        describe('Softskin\'s constant ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        hand: ['softskin', 'softskin']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves'],
                        hand: ['against-the-waves', 'against-the-waves', 'against-the-waves', 'against-the-waves', 'way-of-the-phoenix'],
                        conflictDiscard: ['banzai']
                    }
                });

                this.softskin = this.player1.filterCardsByName('softskin')[0];
                this.softskin2 = this.player1.filterCardsByName('softskin')[1];
                this.againstTheWaves1 = this.player2.filterCardsByName('against-the-waves')[0];
                this.againstTheWaves2 = this.player2.filterCardsByName('against-the-waves')[1];
                this.againstTheWaves3 = this.player2.filterCardsByName('against-the-waves')[2];
                this.againstTheWaves4 = this.player2.filterCardsByName('against-the-waves')[3];
                this.phoenix = this.player2.findCardByName('way-of-the-phoenix');

                this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');
                this.adeptOfTheWaves.fate = 2;
                this.banzai = this.player2.findCardByName('banzai', 'conflict discard pile');
                this.player2.moveCard(this.banzai, 'conflict deck');

                this.player1.clickCard(this.softskin);
                this.player1.clickCard(this.adeptOfTheWaves);
                this.player2.clickCard(this.againstTheWaves1);
                this.player2.clickCard(this.adeptOfTheWaves);
                this.player1.pass();
            });

            it('should \'trigger\' when a card attempts to ready due to a card effect', function() {
                let conflictDeckCount = this.player2.conflictDeck.length;
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 3);
            });

            it('should \'trigger\' when a card attempts to ready from a framework step', function() {
                let conflictDeckCount = this.player2.conflictDeck.length;
                this.player2.pass();
                this.advancePhases('fate');
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 3);
            });

            it('should not prompt the controller with the option to discard 3 cards', function() {
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.player2).not.toHavePrompt('Discard the top three cards of your conflict deck to ready this character?');
                expect(this.player2).not.toHavePromptButton('Yes');
                expect(this.player2).not.toHavePromptButton('No');
            });

            it('should ready the attached character and discard 3 cards from the conflict deck', function() {
                let conflictDeckCount = this.player2.conflictDeck.length;
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.bowed).toBe(false);
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 3);
                expect(this.getChatLogs(1)).toContain('player2 discard Banzai!, Supernatural Storm and Supernatural Storm in order to ready Adept of the Waves');
            });

            it('should discard 3 new cards everytime the attached character is readied', function() {
                let conflictDeckCount = this.player2.conflictDeck.length;
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.bowed).toBe(false);
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 3);
                expect(this.getChatLogs(1)).toContain('player2 discard Banzai!, Supernatural Storm and Supernatural Storm in order to ready Adept of the Waves');
                this.player1.pass();
                this.player2.clickCard(this.againstTheWaves3);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.bowed).toBe(true);
                this.player1.pass();
                this.player2.clickCard(this.againstTheWaves4);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.bowed).toBe(false);
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 6);
                expect(this.getChatLogs(1)).toContain('player2 discard Supernatural Storm, Supernatural Storm and Supernatural Storm in order to ready Adept of the Waves');
            });

            it('should prevent the attached character from readying if there are fewer than 3 cards in the controller\'s conflict deck', function() {
                this.player2.reduceDeckToNumber('conflict deck', 2);
                expect(this.player2.conflictDeck.length).toBe(2);
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.getChatLogs(1)).toContain('player2 cannot pay the additional cost required to ready Adept of the Waves');
            });

            it('should stack', function() {
                this.player2.clickCard(this.phoenix);
                this.player2.clickRing('water');
                this.player1.clickCard(this.softskin2);
                this.player1.clickCard(this.adeptOfTheWaves);
                let conflictDeckCount = this.player2.conflictDeck.length;
                this.player2.clickCard(this.againstTheWaves2);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.player2.conflictDeck.length).toBe(conflictDeckCount - 6);
            });
        });
    });
});
