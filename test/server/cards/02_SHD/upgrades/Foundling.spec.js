describe('Foundling', function () {
    integration(function () {
        describe('Foundling', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['foundling', 'mandalorian-warrior'],
                        groundArena: ['battlefield-marine', 'pyke-sentinel', 'protector-of-the-throne'],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });
            });

            it('\'s ability should give the attached card the Mandalorian trait', function () {
                // check battlefield marine trait
                expect(this.battlefieldMarine.hasSomeTrait('mandalorian')).toBeFalse();

                // add battlefield marine foundling
                this.player1.clickCard(this.foundling);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.snowspeeder, this.pykeSentinel, this.protectorOfTheThrone]);
                this.player1.clickCard(this.battlefieldMarine);

                // check players units traits
                expect(this.battlefieldMarine.hasSomeTrait('mandalorian')).toBeTrue();
                expect(this.pykeSentinel.hasSomeTrait('mandalorian')).toBeFalse();

                this.player2.pass();
                // mandalorian warrior should be able to add experience to battlefield marine
                this.player1.clickCard(this.mandalorianWarrior);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.protectorOfTheThrone]);
            });
        });
    });
});
