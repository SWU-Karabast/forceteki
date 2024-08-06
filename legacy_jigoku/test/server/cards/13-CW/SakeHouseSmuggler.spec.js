describe('Sake House Smuggler', function() {
    integration(function() {
        describe('Sake House Smuggler\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 10,
                        hand: ['against-the-waves', 'jade-tetsubo', 'adept-of-shadows'],
                        inPlay: ['isawa-kaede', 'sake-house-smuggler']
                    },
                    player2: {
                        fate: 10,
                        hand: ['against-the-waves', 'jade-tetsubo', 'adept-of-shadows'],
                        inPlay: ['isawa-kaede']
                    }
                });
                this.smuggler = this.player1.findCardByName('sake-house-smuggler');
                this.isawaKaede1 = this.player1.findCardByName('isawa-kaede');
                this.atw1 = this.player1.findCardByName('against-the-waves');
                this.tetsubo1 = this.player1.findCardByName('jade-tetsubo');
                this.adept1 = this.player1.findCardByName('adept-of-shadows');

                this.isawaKaede2 = this.player2.findCardByName('isawa-kaede');
                this.atw2 = this.player2.findCardByName('against-the-waves');
                this.tetsubo2 = this.player2.findCardByName('jade-tetsubo');
                this.adept2 = this.player2.findCardByName('adept-of-shadows');
            });

            it('should not change the cost of cards before being used', function() {
                this.player1.clickCard(this.atw1);
                this.player1.clickCard(this.isawaKaede1);
                expect(this.player1.fate).toBe(9);

                this.player2.clickCard(this.atw2);
                this.player2.clickCard(this.isawaKaede2);
                expect(this.player2.fate).toBe(9);

                this.player1.playAttachment(this.tetsubo1, this.isawaKaede1);
                expect(this.player1.fate).toBe(7);

                this.player2.playAttachment(this.tetsubo2, this.isawaKaede2);
                expect(this.player2.fate).toBe(7);

                this.player1.clickCard(this.adept1);
                this.player1.clickPrompt('0');
                expect(this.player1.fate).toBe(5);

                this.player2.clickCard(this.adept2);
                this.player2.clickPrompt('0');
                expect(this.player2.fate).toBe(5);
            });

            it('should change the cost of the first non-event', function() {
                this.player1.clickCard(this.smuggler);
                this.player2.pass();

                this.player1.clickCard(this.atw1);
                this.player1.clickCard(this.isawaKaede1);
                expect(this.player1.fate).toBe(9);

                this.player2.clickCard(this.atw2);
                this.player2.clickCard(this.isawaKaede2);
                expect(this.player2.fate).toBe(9);

                this.player1.playAttachment(this.tetsubo1, this.isawaKaede1);
                expect(this.player1.fate).toBe(8);

                this.player2.playAttachment(this.tetsubo2, this.isawaKaede2);
                expect(this.player2.fate).toBe(8);

                this.player1.clickCard(this.adept1);
                this.player1.clickPrompt('0');
                expect(this.player1.fate).toBe(6);

                this.player2.clickCard(this.adept2);
                this.player2.clickPrompt('0');
                expect(this.player2.fate).toBe(6);
            });

            it('should change the cost of characters', function() {
                this.player1.clickCard(this.smuggler);
                this.player2.pass();

                this.player1.clickCard(this.adept1);
                this.player1.clickPrompt('0');
                expect(this.player1.fate).toBe(9);

                this.player2.clickCard(this.adept2);
                this.player2.clickPrompt('0');
                expect(this.player2.fate).toBe(9);
            });
        });

        describe('Sake House Smuggler\'s ability - non-conflict', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        fate: 10,
                        hand: ['against-the-waves', 'jade-tetsubo', 'adept-of-shadows'],
                        inPlay: ['isawa-kaede', 'sake-house-smuggler']
                    },
                    player2: {
                        fate: 10,
                        hand: ['against-the-waves', 'jade-tetsubo', 'adept-of-shadows'],
                        inPlay: ['isawa-kaede']
                    }
                });
                this.smuggler = this.player1.findCardByName('sake-house-smuggler');
                this.isawaKaede1 = this.player1.findCardByName('isawa-kaede');
                this.atw1 = this.player1.findCardByName('against-the-waves');
                this.tetsubo1 = this.player1.findCardByName('jade-tetsubo');
                this.adept1 = this.player1.findCardByName('adept-of-shadows');

                this.isawaKaede2 = this.player2.findCardByName('isawa-kaede');
                this.atw2 = this.player2.findCardByName('against-the-waves');
                this.tetsubo2 = this.player2.findCardByName('jade-tetsubo');
                this.adept2 = this.player2.findCardByName('adept-of-shadows');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should not trigger change the cost of cards', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.smuggler);
                expect(this.player1).toHavePrompt('Action Window');

                this.player1.clickCard(this.atw1);
                this.player1.clickCard(this.isawaKaede1);
                expect(this.player1.fate).toBe(9);

                this.player2.clickCard(this.atw2);
                this.player2.clickCard(this.isawaKaede2);
                expect(this.player2.fate).toBe(9);

                this.player1.playAttachment(this.tetsubo1, this.isawaKaede1);
                expect(this.player1.fate).toBe(7);

                this.player2.playAttachment(this.tetsubo2, this.isawaKaede2);
                expect(this.player2.fate).toBe(7);

                this.player1.clickCard(this.adept1);
                this.player1.clickPrompt('0');
                expect(this.player1.fate).toBe(5);

                this.player2.clickCard(this.adept2);
                this.player2.clickPrompt('0');
                expect(this.player2.fate).toBe(5);
            });
        });
    });
});
