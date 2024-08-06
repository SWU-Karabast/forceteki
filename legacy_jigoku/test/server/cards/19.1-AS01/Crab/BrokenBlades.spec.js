describe('Broken Blades', function () {
    integration(function () {
        describe('Broken Blades\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['one-of-the-forgotten', 'kaiu-envoy'],
                        hand: ['broken-blades']
                    },
                    player2: {
                        inPlay: ['doji-challenger'],
                        fate: 10
                    }
                });

                this.oneOfTheForgotten = this.player1.findCardByName('one-of-the-forgotten');
                this.kaiuEnvoy = this.player1.findCardByName('kaiu-envoy');

                this.dojiChallenger = this.player2.findCardByName('doji-challenger');
                this.dojiChallenger.fate = 2;

                this.brokenBlades = this.player1.findCardByName('broken-blades');
            });

            it('should not trigger if there are no participating characters', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.oneOfTheForgotten, this.kaiuEnvoy],
                    defenders: []
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Break Shameful Display');
            });

            it('does not trigger after you win a military conflict as defender', function () {
                this.noMoreActions();
                this.player1.passConflict();

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.dojiChallenger],
                    defenders: [this.oneOfTheForgotten, this.kaiuEnvoy]
                });

                this.player1.pass();
                this.player2.pass();

                expect(this.player1).not.toHavePrompt('Any reactions?');
                expect(this.player1).toHavePrompt('Initiate an action');
            });

            it('should trigger after you win a military conflict as attacker', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.oneOfTheForgotten, this.kaiuEnvoy],
                    defenders: [this.dojiChallenger]
                });
                this.player2.pass();
                this.player1.pass();
                expect(this.player1).toBeAbleToSelect(this.brokenBlades);

                this.player1.clickCard(this.brokenBlades);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.dojiChallenger);
                expect(this.player1).not.toBeAbleToSelect(this.oneOfTheForgotten);
                expect(this.player1).not.toBeAbleToSelect(this.kaiuEnvoy);

                this.player1.clickCard(this.dojiChallenger);
                expect(this.player1).toHavePrompt('Select card to sacrifice');

                this.player1.clickCard(this.oneOfTheForgotten);
                expect(this.getChatLogs(1)).toContain(
                    'player1 plays Broken Blades, sacrificing One of the Forgotten to ensure Doji Challenger is gone! (player2 recovers 2 fate)'
                );
                expect(this.player2.fate).toBe(12);
                expect(this.dojiChallenger.location).toBe('dynasty discard pile');
            });
        });
    });
});
