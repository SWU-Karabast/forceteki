describe('Promising Kōhai', function () {
    integration(function () {
        describe('Duel Challenge', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger', 'promising-kohai', 'doji-whisperer'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.student = this.player1.findCardByName('promising-kohai');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.whisperer],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.student);
            });

            it('should apply +2 to the duel result', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);
                this.player1.clickCard(this.student);

                expect(this.getChatLogs(10)).toContain('player1 uses Promising Kōhai to add 2 to their duel total');
                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Policy Debate');
                expect(this.getChatLogs(10)).toContain('Kakita Toshimoko: 4 vs 6: Doji Challenger');
            });

            it('should not react if it is your duelist', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.student],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.student);

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Honor Bid');
            });
        });
    });
});
