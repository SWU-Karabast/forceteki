describe('Feigned Weakness', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'gifted-tactician'],
                    hand: ['a-perfect-cut']
                },
                player2: {
                    inPlay: ['bayushi-aramoro'],
                    hand: ['feigned-weakness', 'fine-katana']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.giftedTactician = this.player1.findCardByName('gifted-tactician');
            this.perfectCut = this.player1.findCardByName('a-perfect-cut');
            this.aramoro = this.player2.findCardByName('bayushi-aramoro');
            this.feignedWeakness = this.player2.findCardByName('feigned-weakness');
            this.fineKatana = this.player2.findCardByName('fine-katana');

            this.noMoreActions();
        });

        it('cancels events when losing', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.feignedWeakness);

            this.player2.clickCard(this.feignedWeakness);
            expect(this.player2).toHavePrompt('Select card to discard');
            expect(this.player2).not.toBeAbleToSelect(this.feignedWeakness);
            expect(this.player2).toBeAbleToSelect(this.fineKatana);
            this.player2.clickCard(this.fineKatana);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Feigned Weakness, discarding Fine Katana to cancel the effects of A Perfect Cut'
            );
        });

        it('cancels events when tied', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker, this.giftedTactician],
                defenders: [this.aramoro]
            });

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.feignedWeakness);

            this.player2.clickCard(this.feignedWeakness);
            expect(this.player2).toHavePrompt('Select card to discard');
            expect(this.player2).not.toBeAbleToSelect(this.feignedWeakness);
            expect(this.player2).toBeAbleToSelect(this.fineKatana);
            this.player2.clickCard(this.fineKatana);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Feigned Weakness, discarding Fine Katana to cancel the effects of A Perfect Cut'
            );
        });

        it('does not cancel events when winning', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker],
                defenders: [this.aramoro]
            });

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.feignedWeakness);
        });
    });
});
