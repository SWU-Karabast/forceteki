describe('Soshi Yuka', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['soshi-yuka']
                },
                player2: {
                    inPlay: ['doji-challenger', 'doji-hotaru', 'doji-whisperer', 'brash-samurai']
                }
            });
            this.soshiYuka = this.player1.findCardByName('soshi-yuka');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.brashSamurai = this.player2.findCardByName('brash-samurai');

            this.hotaru.bow();
        });

        it('bows a character out of 2 options', function () {
            this.player1.clickCard(this.soshiYuka);
            expect(this.player2).toHavePrompt('Choose 2 character');
            expect(this.player2).toBeAbleToSelect(this.dojiChallenger);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
            expect(this.player2).toBeAbleToSelect(this.brashSamurai);
            expect(this.player2).not.toBeAbleToSelect(this.hotaru);
            this.player2.clickCard(this.dojiChallenger);
            this.player2.clickCard(this.whisperer);
            this.player2.clickPrompt('Done');

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.dojiChallenger);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.brashSamurai);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.dojiChallenger);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Soshi Yuka to sow discord between Doji Challenger and Doji Whisperer'
            );
            expect(this.getChatLogs(5)).toContain(
                'Doji Challenger is bowed, as they are dragged into a web of intrigue'
            );
        });
    });
});
