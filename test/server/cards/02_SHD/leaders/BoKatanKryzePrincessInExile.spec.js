describe('Bo-Katan Kryze, Princess in Exile', function() {
    integration(function() {
        describe('Bo-Katan\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['mandalorian-warrior', 'battlefield-marine'],
                        leader: 'bokatan-kryze#princess-in-exile',
                        resources: 4 // making leader undeployable makes testing the activated ability's condition smoother
                    },
                    player2: {
                        groundArena: ['protector-of-the-throne'],
                        spaceArena: ['alliance-xwing'],
                    }
                });
            });

            it('should only have an effect if the controller played has attack with a mandalorian this phase, but still be usable otherwise', function () {
                // no attack done; ability has no effect
                expect(this.bokatanKryze).toHaveAvailableActionWhenClickedBy(this.player1);
                expect(this.bokatanKryze.exhausted).toBeTrue();
                expect(this.mandalorianWarrior.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);
                expect(this.protectorOfTheThrone.damage).toBe(0);
                expect(this.allianceXwing.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(0);
                expect(this.player2).toBeActivePlayer();

                this.bokatanKryze.exhausted = false;
                this.player2.pass();

                // no attack done with mandalorian, ability has no effect
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.p2Base);
                this.player2.pass();
                this.player1.clickCard(this.bokatanKryze);
                expect(this.bokatanKryze.exhausted).toBeTrue();
                expect(this.mandalorianWarrior.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);
                expect(this.protectorOfTheThrone.damage).toBe(0);
                expect(this.allianceXwing.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(3);
                expect(this.player2).toBeActivePlayer();

                // attack with a mandalorian
                this.bokatanKryze.exhausted = false;
                this.player2.pass();
                this.player1.clickCard(this.mandalorianWarrior);
                this.player1.clickCard(this.p2Base);

                // attack was done with mandalorian, ability should have an effect
                this.player2.pass();
                this.player1.clickCard(this.bokatanKryze);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.protectorOfTheThrone, this.allianceXwing]);
                expect(this.player1).not.toHavePassAbilityButton();
                this.player1.clickCard(this.allianceXwing);
                expect(this.protectorOfTheThrone.damage).toBe(0);
                expect(this.allianceXwing.damage).toBe(1);
                expect(this.bokatanKryze.exhausted).toBeTrue();
            });
        });

        describe('Bo-Katan\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['mandalorian-warrior', 'battlefield-marine'],
                        leader: { card: 'bokatan-kryze#princess-in-exile', deployed: true },
                    },
                    player2: {
                        groundArena: ['protector-of-the-throne', 'jedha-agitator'],
                        spaceArena: ['alliance-xwing'],
                    }
                });
            });

            it('should deal one damage to 1 or 2 units depends on if you already attack with mandalorian', function () {
                // first attack : only 1 damage
                this.player1.clickCard(this.bokatanKryze);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.protectorOfTheThrone);
                expect(this.p2Base.damage).toBe(4);
                expect(this.protectorOfTheThrone.damage).toBe(1);
                expect(this.player2).toBeActivePlayer();

                // if you attack again with bo katan : only 1 damage trigger
                this.bokatanKryze.exhausted = false;
                this.player2.pass();
                this.player1.clickCard(this.bokatanKryze);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.bokatanKryze);
                expect(this.player2).toBeActivePlayer();
                this.player2.pass();

                // attack with a mandalorian
                this.player1.clickCard(this.mandalorianWarrior);
                this.player1.clickCard(this.p2Base);
                this.bokatanKryze.exhausted = false;
                this.player2.pass();

                // 2 triggers as we attack with another mandalorian (1 damage to 2 different unit)
                this.player1.clickCard(this.bokatanKryze);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.protectorOfTheThrone);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.allianceXwing);
                expect(this.allianceXwing.damage).toBe(1);
                // 1 damage from previously
                expect(this.protectorOfTheThrone.damage).toBe(2);

                // 2 triggers as we attack with another mandalorian (2 damage to 1 unit)
                this.bokatanKryze.exhausted = false;
                this.player2.pass();
                this.player1.clickCard(this.bokatanKryze);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine.damage).toBe(2);

                // 2 triggers as we attack with another mandalorian (2 damage to 1 unit who die on first damage)
                this.bokatanKryze.exhausted = false;
                this.player2.pass();
                this.player1.clickCard(this.bokatanKryze);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.jedhaAgitator);
                expect(this.player1).toBeAbleToSelectExactly([this.mandalorianWarrior, this.battlefieldMarine, this.bokatanKryze, this.protectorOfTheThrone, this.allianceXwing, this.jedhaAgitator]);
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.jedhaAgitator);
                expect(this.jedhaAgitator.location).toBe('discard');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
