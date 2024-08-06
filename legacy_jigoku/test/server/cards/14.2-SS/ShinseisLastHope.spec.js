describe('Shinsei\'s Last Hope', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    fate: 30,
                    inPlay: ['doji-whisperer', 'daidoji-uji'],
                    dynastyDiscard: ['kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai'],
                    provinces: ['shinsei-s-last-hope', 'manicured-garden'],
                    hand: ['charge']
                }
            });

            this.dojiWhisperer = this.player1.findCardByName('doji-whisperer');
            this.lastHope = this.player1.findCardByName('shinsei-s-last-hope', 'province 1');
            this.manicured = this.player1.findCardByName('manicured-garden', 'province 2');
            this.yoshi = this.player1.placeCardInProvince('kakita-yoshi', this.lastHope.location);
            this.toshimoko = this.player1.placeCardInProvince('kakita-toshimoko', 'province 2');
            this.kageyu = this.player1.moveCard('daidoji-kageyu', this.lastHope.location);
            this.chagatai = this.player1.moveCard('moto-chagatai', this.lastHope.location);
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.charge = this.player1.findCardByName('charge');
        });

        it('should reduce the character cost by 2 and enter dishonored', function() {
            this.preYoshiFate = this.player1.fate;

            expect(this.lastHope.facedown).toBe(false);

            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');

            expect(this.player1.fate).toBe(this.preYoshiFate - (this.yoshi.printedCost - 2));
            expect(this.yoshi.isDishonored).toBe(true);
        });

        it('should reduce the character cost by 2 and enter dishonored - disguised characters', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.preKageyuFate = this.player1.fate;

            expect(this.lastHope.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.dojiWhisperer);

            expect(this.player1.fate).toBe(this.preKageyuFate - (this.kageyu.printedCost - this.dojiWhisperer.printedCost - 2));
            expect(this.kageyu.location).toBe('play area');
            expect(this.kageyu.isDishonored).toBe(true);
        });

        it('should reduce the character cost by 2 and enter dishonored and make it so dishonor token can\'t be moved - disguised characters', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.dojiWhisperer.dishonor();
            this.preKageyuFate = this.player1.fate;
            this.preKageyuHonor = this.player1.honor;

            expect(this.lastHope.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.dojiWhisperer);

            expect(this.player1.fate).toBe(this.preKageyuFate - (this.kageyu.printedCost - this.dojiWhisperer.printedCost - 2));
            expect(this.player1.honor).toBe(this.preKageyuHonor - 1); // Kageyu enters play dishonored so the token can't be moved
            expect(this.kageyu.location).toBe('play area');
            expect(this.kageyu.isDishonored).toBe(true);
        });

        it('should not have cost reduced and enter dishonored - play as if from hand', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.preYoshiFate = this.player1.fate;
            this.uji.honor();
            this.game.checkGameState(true);

            expect(this.lastHope.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');

            expect(this.player1.fate).toBe(this.preYoshiFate - this.yoshi.printedCost);
            expect(this.yoshi.location).toBe('play area');
            expect(this.yoshi.isDishonored).toBe(false);
        });

        it('should not enter dishonored - put into play from province', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.dojiWhisperer],
                defenders: []
            });

            expect(this.lastHope.facedown).toBe(false);

            this.player2.pass();
            this.player1.clickCard(this.charge);
            this.player1.clickCard(this.chagatai);


            expect(this.chagatai.location).toBe('play area');
            expect(this.chagatai.isDishonored).toBe(false);
        });

        it('should not influence other provinces', function() {
            this.preToshimokoFate = this.player1.fate;

            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('0');

            expect(this.player1.fate).toBe(this.preToshimokoFate - this.toshimoko.printedCost);
            expect(this.toshimoko.isDishonored).toBe(false);
        });
    });
});
