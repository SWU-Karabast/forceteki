describe('Entrenched', function() {
    integration(function() {
        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        // hand: ['entrenched'],
                        groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });

                this.entrenched = this.player1.findCardByName('entrenched');
                this.wampa = this.player1.findCardByName('wampa');
                this.tieLn = this.player1.findCardByName('tieln-fighter');
                this.cartelSpacer = this.player2.findCardByName('bright-hope#the-last-transport');
                this.p1Base = this.player2.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            // it('should prevent a unit from being able to attack base', function () {
            //     // play upgrade
            //     this.player1.clickCard(this.entrenched);
            //     this.player1.clickCard(this.tieLn);

            //     this.player2.passAction();

            //     // attack with wampa
            //     expect(this.wampa).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            // });

            it('should prevent a unit with no opposing arena units from having the option to attack', function () {
                expect(this.wampa).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
