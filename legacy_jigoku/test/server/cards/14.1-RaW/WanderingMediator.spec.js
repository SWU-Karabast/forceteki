describe('Wandering Mediator', function() {
    integration(function() {
        describe('Wandering Mediator\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['wandering-mediator', 'valiant-oathkeeper']
                    },
                    player2: {
                        provinces: ['dishonorable-assault', 'manicured-garden']
                    }
                });

                this.wanderingMediator = this.player1.findCardByName('wandering-mediator');
                this.valiantOathkeeper = this.player1.findCardByName('valiant-oathkeeper');

                this.assault = this.player2.findCardByName('dishonorable-assault');
                this.manicured = this.player2.findCardByName('manicured-garden');
            });

            it ('should not work outside of conflict', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.wanderingMediator);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('can move it to a conflict at an air province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.valiantOathkeeper],
                    defenders: [],
                    province: this.manicured
                });

                this.player2.pass();
                this.player1.clickCard(this.wanderingMediator);
                expect(this.wanderingMediator.isParticipating()).toBe(true);
            });

            it('can move it home from a conflict at an air province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.wanderingMediator],
                    defenders: [],
                    province: this.manicured
                });

                this.player2.pass();
                this.player1.clickCard(this.wanderingMediator);
                expect(this.wanderingMediator.isParticipating()).toBe(false);
            });

            it('can not move it to a conflict at a non-air province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.valiantOathkeeper],
                    defenders: [],
                    province: this.assault
                });

                this.player2.pass();
                this.player1.clickCard(this.wanderingMediator);
                expect(this.wanderingMediator.isParticipating()).toBe(false);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('can not move it home from a conflict at a non-air province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.wanderingMediator],
                    defenders: [],
                    province: this.assault
                });

                this.player2.pass();
                this.player1.clickCard(this.wanderingMediator);
                expect(this.wanderingMediator.isParticipating()).toBe(true);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
