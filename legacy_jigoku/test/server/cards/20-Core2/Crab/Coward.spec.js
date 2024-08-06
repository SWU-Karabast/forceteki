describe('Coward', function () {
    integration(function () {
        describe('Duel Challenge', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['brash-samurai', 'doji-kuwanan'],
                        hand: ['a-fate-worse-than-death', 'desolation', 'coward-'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    },
                    gameMode: 'emerald'
                });

                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.coward = this.player1.findCardByName('coward-')
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.brash = this.player1.findCardByName('brash-samurai');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately and dishonor', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash, this.kuwanan],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.brash);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.coward);
                this.player1.clickCard(this.coward);
                expect(this.toshimoko.isDishonored).toBe(true);
                expect(this.getChatLogs(10)).toContain('player1 plays Coward! to dishonor a duel challenger');
                expect(this.getChatLogs(10)).toContain('player1 dishonors Kakita Toshimoko');
            });

            it('should use the statistic', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash, this.kuwanan],
                    defenders: [this.toshimoko]
                });

                this.brash.honor();

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.brash);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.coward);
                this.player1.clickCard(this.coward);
                expect(this.toshimoko.isDishonored).toBe(true);
            });

            it('should not react if target is higher skill', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash, this.kuwanan],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.kuwanan);

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });
        });

        describe('Dishonor ability', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['asako-tsuki'],
                        hand: ['against-the-waves']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['coward-']
                    }
                });
                this.asakoTsuki = this.player1.findCardByName('asako-tsuki');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.coward = this.player2.findCardByName('coward-');

                this.atw = this.player1.findCardByName('against-the-waves');
            });

            it('should prompt you to dishonor if opponent passes with a ready character', function() {
                this.noMoreActions();
                this.player1.passConflict();
                expect(this.player2).toHavePrompt('Triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.coward);
                this.player2.clickCard(this.coward);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.asakoTsuki);
                this.player2.clickCard(this.asakoTsuki);
                expect(this.asakoTsuki.isDishonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player2 plays Coward! to dishonor Asako Tsuki');
            });

            it('should prompt you if opponent passes with no ready characters', function() {
                this.player1.clickCard(this.atw);
                this.player1.clickCard(this.asakoTsuki);
                this.noMoreActions();
                expect(this.player2).toHavePrompt('Triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.coward);
            });

            it('should not prompt you if you pass', function() {
                this.noMoreActions();
                this.player1.passConflict();
                expect(this.player2).toHavePrompt('Triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.coward);
                this.player2.pass();
                this.noMoreActions();
                this.player2.passConflict();

                expect(this.player2).not.toHavePrompt('Triggered abilities');
            });
        });
    });
});
