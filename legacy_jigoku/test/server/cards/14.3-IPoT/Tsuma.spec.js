describe('Tsuma', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    fate: 30,
                    inPlay: ['doji-whisperer', 'daidoji-uji'],
                    dynastyDiscard: ['kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai'],
                    provinces: ['tsuma', 'manicured-garden'],
                    hand: ['charge']
                }
            });

            this.dojiWhisperer = this.player1.findCardByName('doji-whisperer');
            this.tsuma = this.player1.findCardByName('tsuma', 'province 1');
            this.manicured = this.player1.findCardByName('manicured-garden', 'province 2');
            this.yoshi = this.player1.placeCardInProvince('kakita-yoshi', this.tsuma.location);
            this.toshimoko = this.player1.placeCardInProvince('kakita-toshimoko', 'province 2');
            this.kageyu = this.player1.moveCard('daidoji-kageyu', this.tsuma.location);
            this.chagatai = this.player1.moveCard('moto-chagatai', this.tsuma.location);
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.charge = this.player1.findCardByName('charge');
        });

        it('should have the character enter honored', function() {
            this.preYoshiFate = this.player1.fate;

            expect(this.tsuma.facedown).toBe(false);

            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');

            expect(this.yoshi.isHonored).toBe(true);
        });

        it('should have the character enter honored - disguised characters', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.tsuma.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.dojiWhisperer);

            expect(this.kageyu.location).toBe('play area');
            expect(this.kageyu.isHonored).toBe(true);
        });

        it('should have the character enter honored and make it so honor token can\'t be moved - disguised characters', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.dojiWhisperer.honor();
            this.preKageyuHonor = this.player1.honor;

            expect(this.tsuma.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.dojiWhisperer);

            expect(this.player1.honor).toBe(this.preKageyuHonor + 1); // Kageyu enters play honored so the token can't be moved
            expect(this.kageyu.location).toBe('play area');
            expect(this.kageyu.isHonored).toBe(true);
        });

        it('should not enter honored - play as if from hand', function() {
            this.player1.pass();
            this.player2.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.uji.honor();
            this.game.checkGameState(true);

            expect(this.tsuma.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');

            expect(this.yoshi.location).toBe('play area');
            expect(this.yoshi.isHonored).toBe(false);
        });

        it('should not enter honored - put into play from province', function() {
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

            expect(this.tsuma.facedown).toBe(false);

            this.player2.pass();
            this.player1.clickCard(this.charge);
            this.player1.clickCard(this.chagatai);


            expect(this.chagatai.location).toBe('play area');
            expect(this.chagatai.isHonored).toBe(false);
        });

        it('should not influence other provinces', function() {
            this.preToshimokoFate = this.player1.fate;

            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('0');

            expect(this.toshimoko.isHonored).toBe(false);
        });
    });
});
