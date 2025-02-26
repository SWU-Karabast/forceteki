describe('Karabast', function() {
    integration(function (contextRef) {
        describe('Karabast\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['karabast'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                        spaceArena: ['mercenary-gunship'],
                    },
                    player2: {
                        groundArena: ['wampa', 'first-legion-snowtrooper'],
                        spaceArena: ['rhokai-gunship']
                    }
                });
            });

            it('should deal damage equal to 1 plus the damage on the friendly unit', function() {
                const { context } = contextRef;

                // Play Karabast with Battlefield Marine
                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mercenaryGunship]);
                context.player1.clickCard(context.battlefieldMarine);

                // Check for enemy unit selection
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.firstLegionSnowtrooper, context.rhokaiGunship]);
                context.player1.clickCard(context.wampa);

                // check game state
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage when the friendly unit has no damage', function() {
                const { context } = contextRef;

                // Play Karabast with Battlefield Marine
                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mercenaryGunship]);
                context.player1.clickCard(context.mercenaryGunship);

                // Check for enemy unit selection
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.firstLegionSnowtrooper, context.rhokaiGunship]);
                context.player1.clickCard(context.wampa);

                // check game state
                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});