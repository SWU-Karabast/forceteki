describe('Tsangusuri Ward', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'miya-mystic'],
                    hand: ['tsangusuri-ward', 'ornate-fan']
                },
                player2: {
                    inPlay: ['doji-challenger', 'asahina-artisan'],
                    hand: ['fine-katana']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.ward = this.player1.findCardByName('tsangusuri-ward');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.katana = this.player2.findCardByName('fine-katana');
        });

        it('should only attach to a character you control', function () {
            this.player1.clickCard(this.ward);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.mystic);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should only be playable if you control a shugenja', function () {
            this.player1.moveCard(this.mystic, 'dynasty discard pile');
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.ward);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should normally be able to play yours and opponent attachments on the character', function () {
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.katana);
            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.attachments).toContain(this.fan);
            expect(this.yoshi.attachments).toContain(this.katana);
        });

        it('should block opponent attachments on the character', function () {
            this.player1.clickCard(this.ward);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.katana);
            expect(this.player2).toBeAbleToSelect(this.mystic);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);

            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.attachments).not.toContain(this.katana);
        });

        it('should not block your attachments on the character', function () {
            this.player1.clickCard(this.ward);
            this.player1.clickCard(this.yoshi);
            this.player2.pass();
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.attachments).toContain(this.fan);
        });

        it('should not cause opponent\'s  attachments to fall off', function () {
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.katana);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.ward);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.attachments).toContain(this.fan);
            expect(this.yoshi.attachments).toContain(this.katana);
            expect(this.yoshi.attachments).toContain(this.ward);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
