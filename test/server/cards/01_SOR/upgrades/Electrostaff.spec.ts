describe('Electrostaff', function() {
    integration(function(contextRef) {
        describe('Electrostaff\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['electrostaff'] }]
                    },
                    player2: {
                        groundArena: ['resourceful-pursuers', 'cargo-juggernaut']
                    }
                });
            });

            it('should cause the attached card to heal 2 damage from base on attack', function () {
                const { context } = contextRef;

                // battlefield marine attack, damage should be apply as usual
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
            });
        });
    });
});
