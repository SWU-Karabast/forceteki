describe('Shoot First', function () {
    integration(function () {
        describe('Shoot First Ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['pyke-sentinel', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol'],
                    }
                });
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender', function () {
                this.player1.clickCard(this.shootFirst);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.battlefieldMarine]);
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.r2d2);

                // check game state
                expect(this.r2d2.location).toBe('discard');
                expect(this.battlefieldMarine.damage).toBe(0);
                expect(this.shootFirst.location).toBe('discard');
            });
        });
    });
});