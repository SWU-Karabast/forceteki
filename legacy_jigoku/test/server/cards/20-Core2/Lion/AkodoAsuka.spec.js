describe('Akodo Asuka', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-asuka', 'matsu-berserker'],
                    hand: ['fine-katana']
                },
                player2: {}
            });
            this.akodoAsuka = this.player1.findCardByName('akodo-asuka');
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.katana = this.player1.findCardByName('fine-katana');
        });

        it('triggers after she wins a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoAsuka],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toBeAbleToSelect(this.akodoAsuka);
        });

        it('draws a card from the top, depending on number of participants', function () {
            const initialHandSize = this.player1.hand.length;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoAsuka, this.matsuBerserker],
                defenders: []
            });
            this.noMoreActions();
            this.player1.clickCard(this.akodoAsuka);

            expect(this.player1).toHavePrompt('Akodo Asuka');
            this.player1.clickPrompt('Supernatural Storm (2)');
            expect(this.player1.hand.length).toBe(initialHandSize + 1);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Akodo Asuka to look at the top 2 cards of their conflict deck'
            );
            expect(this.getChatLogs(5)).toContain('player1 takes 1 card');
        });
    });
});
