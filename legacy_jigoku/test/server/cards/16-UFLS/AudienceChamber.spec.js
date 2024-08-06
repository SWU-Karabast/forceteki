describe('Audience Chamber', function() {
    integration(function() {
        describe('Dynasty Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['isawa-tadaka', 'doji-challenger', 'audience-chamber']
                    },
                    player2: {
                        dynastyDiscard: ['daidoji-uji']
                    }
                });

                this.tadaka = this.player1.findCardByName('isawa-tadaka');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.chamber = this.player1.findCardByName('audience-chamber');
                this.uji = this.player2.findCardByName('daidoji-uji');
                this.player1.placeCardInProvince(this.chamber, 'province 1');
                this.player1.placeCardInProvince(this.challenger, 'province 2');
                this.player1.placeCardInProvince(this.tadaka, 'province 3');
                this.player2.placeCardInProvince(this.uji, 'province 1');
            });

            it('should trigger if you play a character that costs 4 or more', function() {
                this.player1.clickCard(this.tadaka);
                this.player1.clickPrompt('0');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chamber);
                expect(this.tadaka.fate).toBe(0);
                expect(this.tadaka.location).toBe('play area');
                this.player1.clickCard(this.chamber);
                expect(this.tadaka.fate).toBe(1);
                expect(this.getChatLogs(5)).toContain('player1 uses Audience Chamber to place 1 fate on Isawa Tadaka');
            });

            it('should not trigger if you play a character that costs 3 or less', function() {
                this.player1.clickCard(this.challenger);
                this.player1.clickPrompt('0');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('should not trigger if opponent plays a character that costs 4 or more', function() {
                this.player1.clickCard(this.challenger);
                this.player1.clickPrompt('0');

                this.player2.clickCard(this.uji);
                this.player2.clickPrompt('0');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });
        });

        describe('Conflict Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['steward-of-law'],
                        dynastyDiscard: ['doji-kuwanan', 'audience-chamber'],
                        hand: ['charge', 'isawa-tadaka-2']
                    },
                    player2: {
                    }
                });

                this.law = this.player1.findCardByName('steward-of-law');
                this.charge = this.player1.findCardByName('charge');
                this.chamber = this.player1.findCardByName('audience-chamber');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.tadaka = this.player1.findCardByName('isawa-tadaka-2');
                this.player1.placeCardInProvince(this.kuwanan, 'province 1');
                this.player1.placeCardInProvince(this.chamber, 'province 2');
            });

            it('should not trigger on put into play', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.law],
                    defenders: [],
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.kuwanan);
                expect(this.kuwanan.location).toBe('play area');
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should trigger on playing from hand', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.law],
                    defenders: [],
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.tadaka);
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Conflict');
                expect(this.tadaka.location).toBe('play area');
                expect(this.tadaka.fate).toBe(0);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chamber);
                this.player1.clickCard(this.chamber);
                expect(this.tadaka.fate).toBe(1);
            });
        });
    });
});
