describe('Those Who Serve', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    fate: 10,
                    hand: ['those-who-serve', 'ikoma-reservist'],
                    dynastyDeck: ['tactician-s-apprentice', 'gifted-tactician', 'eager-scout', 'meishodo-wielder', 'yasuki-procurer', 'yasuki-procurer']
                },
                player2: {
                    fate: 10,
                    dynastyDeck: ['fushicho']
                }
            });
            this.thoseWhoServe = this.player1.findCardByName('those-who-serve');
            this.ikomaReservist = this.player1.findCardByName('ikoma-reservist');
            this.tacticiansApprentice = this.player1.placeCardInProvince('tactician-s-apprentice', 'province 1'); //1
            this.giftedTactician = this.player1.placeCardInProvince('gifted-tactician', 'province 2'); //2
            this.eagerScout = this.player1.placeCardInProvince('eager-scout', 'province 3'); //0
            this.wielder = this.player1.placeCardInProvince('meishodo-wielder', 'province 4'); //2, reduced to 1

            this.procurer1 = this.player1.filterCardsByName('yasuki-procurer')[0];
            this.procurer2 = this.player1.filterCardsByName('yasuki-procurer')[1];

            this.player1.moveCard(this.procurer1, 'province 1');
            this.procurer1.facedown = false;
            this.player1.moveCard(this.procurer2, 'province 2');
            this.procurer2.facedown = false;

            this.birb = this.player2.placeCardInProvince('fushicho', 'province 1');
        });

        it('should reduce own character cost by 1', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass();
            expect(this.player1.fate).toBe(fate - 1);
            this.player1.clickCard(this.giftedTactician);
            this.player1.clickPrompt('2');
            expect(this.player1.fate).toBe(fate - 1 - 1 - 2);
        });

        it('should not reduce opponent\'s character costs', function() {
            let fate = this.player2.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.clickCard(this.birb);
            this.player2.clickPrompt('2');
            expect(this.player2.fate).toBe(fate - 6 - 2);
        });

        it('should reduce to a minimum of 1 (character costs 1)', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass();
            this.player1.clickCard(this.tacticiansApprentice);
            this.player1.clickPrompt('2');
            expect(this.player1.fate).toBe(fate - 1 - 1 - 2);
        });

        it('should reduce to a minimum of 1 (character costs 0, should still cost 0)', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass();
            this.player1.clickCard(this.eagerScout);
            this.player1.clickPrompt('2');
            expect(this.player1.fate).toBe(fate - 1 - 0 - 2);
        });

        it('should reduce to a minimum of 1 (stacking cost reductions)', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass();
            this.player1.clickCard(this.wielder);
            this.player1.clickPrompt('2');
            expect(this.player1.fate).toBe(fate - 1 - 1 - 2);
        });

        it('should reduce to a minimum of 1 (stacking cost reductions below 0)', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass();
            this.player1.clickCard(this.procurer1);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.procurer2);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.procurer1);
            this.player1.clickCard(this.procurer2);
            this.player1.clickCard(this.giftedTactician);
            this.player1.clickPrompt('0');
            expect(this.player1.fate).toBe(fate - 1 - 1 - 1 - 1);
        });

        it('should not have its effect last beyond dynasty phase', function() {
            this.player1.clickCard(this.thoseWhoServe);
            this.player2.pass(); // player2 gets passing fate
            this.player1.pass();
            this.player1.clickPrompt('1'); // Bid
            this.player2.clickPrompt('1'); // Bid
            this.player1.clickCard(this.ikomaReservist);
            this.player1.clickPrompt('0');
            expect(this.player1.fate).toBe(8); // 10 - 1 TWS - 1 IR
        });

        it('should not be playable outside of dynasty phase', function() {
            this.player1.pass(); // player1 gets passing fate
            this.player2.pass();
            this.player1.clickPrompt('1'); // Bid
            this.player2.clickPrompt('1'); // Bid
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.thoseWhoServe);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
