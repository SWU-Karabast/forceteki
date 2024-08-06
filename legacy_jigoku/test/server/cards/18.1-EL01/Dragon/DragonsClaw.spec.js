describe('Dragons Claw', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'doji-kuwanan']
                },
                player2: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['dragon-s-claw', 'dragon-s-fang']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');

            this.claw = this.player2.findCardByName('dragon-s-claw');
            this.fang = this.player2.findCardByName('dragon-s-fang');

            this.player1.pass();
            this.player2.playAttachment(this.claw, this.yoshi);
        });

        describe("When Dragon's Fang is not attached", function () {
            beforeEach(function () {
                this.noMoreActions();
            });

            it('sends home bowed a character with less MIL skill', function () {
                this.initiateConflict({
                    attackers: [this.challenger, this.kuwanan],
                    defenders: [this.yoshi]
                });

                expect(this.player2).toHavePrompt('Conflict Action Window');

                this.player2.clickCard(this.yoshi);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });

        describe("When Dragon's Fang is also attached", function () {
            beforeEach(function () {
                this.player1.pass();
                this.player2.playAttachment(this.fang, this.yoshi);
                this.noMoreActions();
            });

            it('sends home bowed a character with less MIL skill', function () {
                this.initiateConflict({
                    attackers: [this.challenger, this.kuwanan],
                    defenders: [this.yoshi]
                });

                expect(this.player2).toHavePrompt('Conflict Action Window');

                this.player2.clickCard(this.yoshi);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);

                this.player2.clickCard(this.challenger);
                expect(this.challenger.bowed).toBe(true);
                expect(this.challenger.isParticipating()).toBe(false);

                expect(this.getChatLogs(5)).toContain(
                    "player2 uses Kakita Yoshi's gained ability from Dragon's Claw to bow Doji Challenger and send Doji Challenger home"
                );
            });
        });
    });
});
