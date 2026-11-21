describe('Rukh, Thrawn\'s Assassin', function() {
    integration(function(contextRef) {
        describe('Rukh\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['rukh#thrawns-assassin'],
                    },
                    player2: {
                        groundArena: ['wampa', 'escort-skiff', 'atst', { card: 'battlefield-marine', upgrades: ['shield'] }],
                    }
                });
            });

            it('will defeat a unit if he deals combat damage to it while attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
            });

            it('will not trigger when Rukh is attacked', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.escortSkiff);
                context.player2.clickCard(context.rukh);
                expect(context.escortSkiff).toBeInZone('groundArena');
                expect(context.escortSkiff.damage).toBe(3);
                expect(context.rukh.damage).toBe(4);
            });

            it('will not trigger when the combat damage is prevented by a Shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.rukh.damage).toBe(3);
            });

            it('will not trigger when the defender is defeated by the combat damage', function () {
                const { context } = contextRef;

                // first attack pops the Shield so the second attack defeats the Battlefield Marine
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                context.readyCard(context.rukh);
                context.setDamage(context.rukh, 0);
                context.player2.passAction();

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.rukh.damage).toBe(3);
            });

            it('will not trigger when Rukh attacks a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base).toBeInZone('base');
                expect(context.p2Base.damage).toBe(3);
            });

            it('will still trigger when Rukh is defeated in the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard');
                expect(context.rukh).toBeInZone('discard');
            });

            // Ruling 2025-04-23: Rukh's ability does not resolve until the end of the combat damage
            // step, even with Shoot First. Shoot First lets the attacker deal damage first, but does
            // not pull Rukh's defeat ability earlier.
            it('does not resolve until the end of the combat damage step even with Shoot First', function () {
                const { context } = contextRef;

                // Rukh (4 power with Shoot First) deals combat damage to the AT-ST first, but it
                // survives. Rukh's defeat ability resolves at the end of the combat damage step,
                // so the AT-ST still deals its combat damage back, defeating Rukh, before it is
                // defeated by the ability.
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard');
                expect(context.rukh).toBeInZone('discard');
            });
        });
    });
});
