describe('Entrenched', function() {
    integration(function() {
        describe('When an upgrade', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched', 'academy-training', 'resilient'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: ['luke-skywalker#faithful-friend']
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });

                this.entrenched = this.player1.findCardByName('entrenched');
                this.academyTraining = this.player1.findCardByName('academy-training');
                this.resilient = this.player1.findCardByName('resilient');
                this.wampa = this.player1.findCardByName('wampa');
                this.tieLn = this.player1.findCardByName('tieln-fighter');
                this.brightHope = this.player2.findCardByName('bright-hope#the-last-transport');
                this.p1Base = this.player2.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('is played, it should be able to be attached to any ground or space unit and apply a stat bonus to it', function () {
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades).toContain(this.entrenched);
                expect(this.wampa.hp).toBe(8);
                expect(this.wampa.power).toBe(7);
            });
        });
    });
});
