describe('Play upgrade from hand', function() {
    integration(function() {
        describe('When an upgrade is played,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched', 'academy-training', 'resilient', 'foundling'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'director-krennic#aspiring-to-authority'
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });
            });

            it('it should be able to be attached to any ground or space unit and apply a stat bonus to it', function () {
                // upgrade attaches to friendly ground unit
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter, this.brightHope]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades).toContain(this.entrenched);
                expect(this.entrenched).toBeInLocation('ground arena');
                expect(this.wampa.getPower()).toBe(7);
                expect(this.wampa.getHp()).toBe(8);

                expect(this.player1.countExhaustedResources()).toBe(2);

                this.player2.passAction();

                // upgrade attaches to friendly space unit
                this.player1.clickCard(this.academyTraining);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter, this.brightHope]);
                this.player1.clickCard(this.tielnFighter);
                expect(this.tielnFighter.upgrades).toContain(this.academyTraining);
                expect(this.academyTraining).toBeInLocation('space arena');
                expect(this.tielnFighter.getPower()).toBe(4);
                expect(this.tielnFighter.getHp()).toBe(3);

                expect(this.player1.countExhaustedResources()).toBe(6);

                this.player2.passAction();

                // upgrade attaches to enemy unit
                this.player1.clickCard(this.resilient);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter, this.brightHope]);
                this.player1.clickCard(this.brightHope);
                expect(this.brightHope.upgrades).toContain(this.resilient);
                expect(this.resilient).toBeInLocation('space arena', this.player2);
                expect(this.brightHope.getPower()).toBe(2);
                expect(this.brightHope.getHp()).toBe(9);

                // confirm that the upgrade is still controlled by the player who played it
                expect(this.resilient.controller).toBe(this.player1.player);
            });
        });
    });
});
