describe('Entrenched', function() {
    integration(function() {
        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: ['luke-skywalker#faithful-friend']
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });

                this.entrenched = this.player1.findCardByName('entrenched');
                this.wampa = this.player1.findCardByName('wampa');
                this.tieLn = this.player1.findCardByName('tieln-fighter');
                this.cartelSpacer = this.player2.findCardByName('bright-hope#the-last-transport');
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should prevent a unit with no opposing arena units from being able to attack', function () {
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toHavePrompt('ground arena');
            });
        });
    });
});
