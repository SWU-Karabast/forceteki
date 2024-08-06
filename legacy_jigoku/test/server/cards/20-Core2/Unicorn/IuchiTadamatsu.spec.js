describe('Iuchi Tadamatsu', function () {
    integration(function () {
        describe('Discount ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 1,
                        inPlay: ['iuchi-tadamatsu'],
                        hand: ['force-of-the-river']
                    },
                    player2: {
                        inPlay: []
                    }
                });
            });

            it('should reduce the cost of playing meishodo attachments on himself', function () {
                this.forceOfTheRiver = this.player1.playAttachment('force-of-the-river', 'iuchi-tadamatsu');
                expect(this.forceOfTheRiver.location).toBe('play area');
                expect(this.player1.fate).toBe(1);
            });

            it('should allow players to pay 0 cost attachments with 0 fate', function () {
                this.player1.fate = 0;
                this.forceOfTheRiver = this.player1.playAttachment('force-of-the-river', 'iuchi-tadamatsu');
                expect(this.forceOfTheRiver.location).toBe('play area');
            });
        });

        describe('Ready ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 1,
                        inPlay: ['iuchi-tadamatsu'],
                        hand: ['force-of-the-river']
                    },
                    player2: {
                        hand: ['fiery-madness']
                    }
                });

                this.tadamatsu = this.player1.findCardByName('iuchi-tadamatsu');
                this.forceOfTheRiver = this.player1.findCardByName('force-of-the-river');
                this.tadamatsu.bow();

                this.fieryMadness = this.player2.findCardByName('fiery-madness');

                this.player1.clickCard(this.forceOfTheRiver);
                this.player1.clickCard(this.tadamatsu);
                this.player2.clickCard(this.fieryMadness);
                this.player2.clickCard(this.tadamatsu);
            });

            it('readies itself', function () {
                this.player1.clickCard(this.tadamatsu);
                expect(this.player1).toHavePrompt('Select card to sacrifice');
                expect(this.player1).toBeAbleToSelect(this.forceOfTheRiver);
                expect(this.player1).not.toBeAbleToSelect(this.fieryMadness);

                this.player1.clickCard(this.forceOfTheRiver);
                expect(this.forceOfTheRiver.location).toBe('conflict discard pile');
                expect(this.tadamatsu.bowed).toBe(false);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Iuchi Tadamatsu, sacrificing Force of the River to ready Iuchi Tadamatsu'
                );
            });
        });
    });
});