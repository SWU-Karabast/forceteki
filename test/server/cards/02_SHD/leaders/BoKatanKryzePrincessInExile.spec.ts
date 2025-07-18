describe('Bo-Katan Kryze, Princess in Exile', function() {
    integration(function(contextRef) {
        describe('Bo-Katan\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                const { context } = contextRef;

                // no attack done; ability has no effect
                expect(context.bokatanKryze).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Use it anyway');
                expect(context.bokatanKryze.exhausted).toBeTrue();
                expect(context.mandalorianWarrior.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.protectorOfTheThrone.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.readyCard(context.bokatanKryze);

                // enemy mandalorian attacks
                context.player2.clickCard(context.protectorOfTheThrone);
                context.player2.clickCard(context.p1Base);

                // no attack done with friendly mandalorian, ability has no effect
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickPrompt('Use it anyway');
                expect(context.bokatanKryze.exhausted).toBeTrue();
                expect(context.mandalorianWarrior.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.protectorOfTheThrone.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();

                // attack with a mandalorian
                context.readyCard(context.bokatanKryze);
                context.player2.passAction();
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.p2Base);

                // attack was done with mandalorian, ability should have an effect
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.protectorOfTheThrone, context.allianceXwing]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);
                expect(context.protectorOfTheThrone.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(1);
                expect(context.bokatanKryze.exhausted).toBeTrue();
            });
        });

        describe('Bo-Katan\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                const { context } = contextRef;

                // first attack : only 1 damage
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.protectorOfTheThrone);
                expect(context.p2Base.damage).toBe(4);
                expect(context.protectorOfTheThrone.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();

                // if you attack again with bo katan : only 1 damage trigger
                context.readyCard(context.bokatanKryze);
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.player2).toBeActivePlayer();

                // attack with enemy mandalorian
                context.player2.clickCard(context.protectorOfTheThrone);
                context.player2.clickCard(context.p1Base);

                // if you attack again with bo katan : only 1 damage trigger
                context.readyCard(context.bokatanKryze);
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // attack with a mandalorian
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.p2Base);
                context.readyCard(context.bokatanKryze);
                context.player2.passAction();

                // 2 triggers as we attack with another mandalorian (1 damage to 2 different unit)
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                // prompt does not change between 2 effects of bo katan ability
                context.player1.clickCardNonChecking(context.protectorOfTheThrone);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.damage).toBe(1);
                // 1 damage from previously
                expect(context.protectorOfTheThrone.damage).toBe(2);

                // 2 triggers as we attack with another mandalorian (2 damage to 1 unit)
                context.readyCard(context.bokatanKryze);
                context.setDamage(context.p2Base, 0);
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                // prompt does not change between 2 effects of bo katan ability
                context.player1.clickCardNonChecking(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);

                // 2 triggers as we attack with another mandalorian (2 damage to 1 unit who die on first damage)
                context.readyCard(context.bokatanKryze);
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing, context.jedhaAgitator]);
                expect(context.player1).toHaveChooseNothingButton();
                // prompt does not change between 2 effects of bo katan ability
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.jedhaAgitator.zoneName).toBe('discard');
                expect(context.player2).toBeActivePlayer();

                // 2 triggers as we attack with another mandalorian (2 damage to 1 unit who die on first damage)
                context.readyCard(context.bokatanKryze);
                context.player2.passAction();
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing]);
                expect(context.player1).toHaveChooseNothingButton();
                // prompt does not change between 2 effects of bo katan ability
                context.player1.clickPrompt('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.battlefieldMarine, context.bokatanKryze, context.protectorOfTheThrone, context.allianceXwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
