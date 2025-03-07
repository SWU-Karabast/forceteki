describe('Electrostaff', function() {
    integration(function(contextRef) {
        describe('Electrostaff\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['electrostaff'],
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    },
                    player2: {
                        groundArena: ['resourceful-pursuers', 'cargo-juggernaut']
                    }
                });
            });

            it('should give -1/-0 to the attacker while the attached unit is defending', function () {
                const { context } = contextRef;

                // Can't attach to vehicle units
                context.player1.clickCard(context.electrostaff);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.resourcefulPursuers,
                ]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // battlefield marine attack, damage should be applied as usual
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.cargoJuggernaut);
                expect(context.battlefieldMarine.damage).toBe(4);
                expect(context.cargoJuggernaut.damage).toBe(5);
                context.battlefieldMarine.damage = 0;

                // resourceful pursuers attack battlefield marine, battlefield marine should take 1 damage less
                context.player2.clickCard(context.resourcefulPursuers);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(4);
                expect(context.resourcefulPursuers.damage).toBe(5);

                context.setDamage(context.battlefieldMarine, 0);
                context.setDamage(context.cargoJuggernaut, 0);
                context.player1.passAction();

                // attack another unit with cargo juggernaut, nothing special should happen
                context.player2.clickCard(context.cargoJuggernaut);
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.cargoJuggernaut.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(4);
            });
        });
    });
});
