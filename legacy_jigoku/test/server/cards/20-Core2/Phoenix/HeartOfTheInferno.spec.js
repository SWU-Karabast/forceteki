describe('Heart of the Inferno', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['heart-of-the-inferno'],
                    inPlay: ['fire-tensai-initiate', 'solemn-scholar', 'valiant-oathkeeper']
                },
                player2: {
                    hand: ['fine-katana'],
                    inPlay: ['brash-samurai', 'doji-whisperer']
                }
            });

            this.heartOfTheInferno = this.player1.findCardByName('heart-of-the-inferno');
            this.fireTensai = this.player1.findCardByName('fire-tensai-initiate');
            this.solemn = this.player1.findCardByName('solemn-scholar');
            this.valiant = this.player1.findCardByName('valiant-oathkeeper');

            this.katana = this.player2.findCardByName('fine-katana');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.player1.pass();
            this.player2.playAttachment(this.katana, this.brash);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fireTensai, this.solemn, this.valiant],
                defenders: [this.brash, this.whisperer],
                type: 'military'
            });
        });

        it('without affinity, and no valid target', function () {
            this.player1.moveCard(this.fireTensai, 'dynasty discard pile');
            this.player2.moveCard(this.whisperer, 'dynasty discard pile');

            this.player2.pass();
            this.player1.clickCard(this.heartOfTheInferno);
            expect(this.player1).not.toHavePrompt('Choose a card');
            expect(this.player1).not.toBeAbleToSelect(this.fireTensai);
            expect(this.player1).not.toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.valiant);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.katana);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
        });

        it('without affinity, bow a character without attachment', function () {
            this.player1.moveCard(this.fireTensai, 'dynasty discard pile');

            this.player2.pass();
            this.player1.clickCard(this.heartOfTheInferno);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).not.toBeAbleToSelect(this.fireTensai);
            expect(this.player1).not.toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.valiant);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.whisperer);

            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Heart of the Inferno to bow Doji Whisperer');
        });

        it('with affinity, bow a character without attachment', function () {
            this.player2.pass();
            this.player1.clickCard(this.heartOfTheInferno);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).not.toBeAbleToSelect(this.fireTensai);
            expect(this.player1).not.toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.valiant);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.whisperer);

            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Heart of the Inferno to bow Doji Whisperer');
        });

        it('with affinity, discard an attachment', function () {
            this.player2.pass();
            this.player1.clickCard(this.heartOfTheInferno);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).not.toBeAbleToSelect(this.fireTensai);
            expect(this.player1).not.toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.valiant);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.whisperer);

            this.player1.clickCard(this.katana);
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 plays Heart of the Inferno to discard Fine Katana');
        });
    });
});
