describe('Qi\'ra, I Alone Survived', function () {
    integration(function () {
        describe('Qi\'ra\'s undeployed ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'qira#i-alone-survived',
                        groundArena: ['hylobon-enforcer', 'death-star-stormtrooper'],
                        spaceArena: ['green-squadron-awing'],
                        resources: 4,
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should deal 2 damage on a friendly unit and give it a shield', function () {
                this.player1.clickCard(this.qira);
                expect(this.player1).toBeAbleToSelectExactly([this.greenSquadronAwing, this.deathStarStormtrooper, this.hylobonEnforcer]);
                this.player1.clickCard(this.hylobonEnforcer);

                expect(this.hylobonEnforcer.damage).toBe(2);
                expect(this.qira.exhausted).toBeTrue();
                expect(this.player1.countExhaustedResources()).toBe(1);
                expect(this.hylobonEnforcer).toHaveExactUpgradeNames(['shield']);

                // try to give a shield to a unit with less than 2 hp
                this.player2.passAction();
                this.player1.clickCard(this.hylobonEnforcer);
                expect(this.p2Base.damage).toBe(3);
                this.qira.exhausted = false;
                this.player2.passAction();

                this.player1.clickCard(this.qira);
                this.player1.clickCard(this.deathStarStormtrooper);
                expect(this.deathStarStormtrooper.location).toBe('discard');
            });
        });

        describe('Qi\'ra\'s deployed ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'qira#i-alone-survived',
                        groundArena: [{ card: 'hylobon-enforcer', damage: 3 }, 'death-star-stormtrooper'],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['shield'] }],
                        resources: 5,
                    },
                    player2: {
                        groundArena: [{ card: 'rugged-survivors', upgrades: ['academy-training'] }],
                        spaceArena: ['grey-squadron-ywing'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
            });

            it('should deal heal and damage all units in play', function () {
                this.player1.clickCard(this.qira);
                this.player1.clickPrompt('Deploy Qi’ra');

                expect(this.player2).toBeActivePlayer();
                expect(this.qira.damage).toBe(4); // 8/2 = 4
                expect(this.deathStarStormtrooper.damage).toBe(0); // 1/2 = 0
                expect(this.greenSquadronAwing.damage).toBe(0); // shield => 0
                expect(this.greenSquadronAwing.isUpgraded()).toBeFalse(); // lost his shield
                expect(this.ruggedSurvivors.damage).toBe(3); // (5+2=7)/2 = 3
                expect(this.greySquadronYwing.damage).toBe(1); // 3/2 = 1
                expect(this.hylobonEnforcer.damage).toBe(2);// 4/2 = 1

                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(5);
            });
        });
    });
});
