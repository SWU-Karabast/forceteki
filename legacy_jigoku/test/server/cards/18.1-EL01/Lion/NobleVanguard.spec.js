describe('Noble Vanguard', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['shosuro-botanist', 'daidoji-uji'],
                    dynastyDiscard: ['noble-vanguard'],
                    hand: ['fine-katana']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.katana = this.player1.findCardByName('fine-katana');
            this.vanguard = this.player1.findCardByName('noble-vanguard');
            this.botanist = this.player1.findCardByName('shosuro-botanist');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.player1.placeCardInProvince(this.vanguard, 'province 1');
        });

        it('should put the top card of your deck into a +1/+1 attachment', function () {
            this.player1.moveCard(this.katana, 'conflict deck');

            this.player1.clickCard(this.vanguard);
            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.vanguard);
            this.player1.clickCard(this.vanguard);
            this.player1.clickCard(this.uji);

            expect(this.katana.location).toBe('removed from game');
            expect(this.uji.attachments.length).toBe(1);
            expect(this.uji.getMilitarySkill()).toBe(7);
            expect(this.uji.getPoliticalSkill()).toBe(3);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Noble Vanguard to attach the top card of their conflict deck to Daidoji Uji as a +1/+1 attachment'
            );
        });
    });
});
