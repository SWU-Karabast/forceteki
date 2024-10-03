describe('Foundling', function () {
    integration(function () {
        describe('Foundling', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['foundling'],
                        groundArena: ['battlefield-marine', 'pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });
            });

            it('should gain mandalorian\'s trait', function () {
                // check battlefield marine trait
                expect(this.battlefieldMarine.hasSomeTrait('mandalorian')).toBeFalse();

                // add battlefield marine foundling
                this.player1.clickCard(this.foundling);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.snowspeeder, this.pykeSentinel]);
                this.player1.clickCard(this.battlefieldMarine);

                // check players units traits
                expect(this.battlefieldMarine.hasSomeTrait('mandalorian')).toBeTrue();
                expect(this.pykeSentinel.hasSomeTrait('mandalorian')).toBeFalse();
            });
        });
    });
});
