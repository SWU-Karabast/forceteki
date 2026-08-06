describe('Rukh, Thrawn\'s Assassin', function() {
    integration(function(contextRef) {
        describe('Rukh\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rukh#thrawns-assassin'],
                    },
                    player2: {
                        groundArena: ['wampa', 'escort-skiff', 'atst', { card: 'battlefield-marine', upgrades: ['shield'] }],
                    }
                });
            });

            it('will defeat a unit if he deals combat damage to it while attacking', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.readyCard(context.rukh);
                    context.setDamage(context.rukh, 0);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Rukh attacks and survives
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                reset(false);

                // CASE 2: Rukh is attacked, ability doesn't trigger
                context.player2.clickCard(context.escortSkiff);
                context.player2.clickCard(context.rukh);
                expect(context.escortSkiff).toBeInZone('groundArena');
                expect(context.escortSkiff.damage).toBe(3);
                expect(context.rukh.damage).toBe(4);

                reset(false);

                // CASE 3: Rukh attacks into shield, ability doesn't trigger
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.rukh.damage).toBe(3);

                reset();

                // CASE 4: Rukh attacks and target is killed by regular combat damage, ability naturally fizzles
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.rukh.damage).toBe(3);

                reset();

                // CASE 5: Rukh attacks base
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base).toBeInZone('base');
                expect(context.p2Base.damage).toBe(3);

                reset();

                // CASE 6: Rukh dies while attacking, ability still triggers
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard');
                expect(context.rukh).toBeInZone('discard');
            });

            // Ruling 2025-04-23: Rukh's ability does not resolve until the end of the combat damage
            // step, even with Shoot First. Shoot First lets the attacker deal damage first, but does
            // not pull Rukh's defeat ability earlier.
            xit('does not resolve until the end of the combat damage step even with Shoot First', function () {
                // Rukh attacks with Shoot First active. His defeat ability should still resolve at the
                // end of the combat damage step, not before the defender would have dealt damage.
            });
        });
    });
});
