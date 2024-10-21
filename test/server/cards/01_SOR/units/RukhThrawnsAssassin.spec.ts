describe('Rukh, Thrawn\'s Assassin', function() {
    integration(function(contextRef) {
        describe('Rukh\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                    context.rukh.exhausted = false;
                    context.rukh.damage = 0;
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Rukh attacks and survives
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInLocation('discard');

                reset(false);

                // CASE 2: Rukh is attacked, ability doesn't trigger
                context.player2.clickCard(context.escortSkiff);
                context.player2.clickCard(context.rukh);
                expect(context.escortSkiff).toBeInLocation('ground arena');
                expect(context.escortSkiff.damage).toBe(3);
                expect(context.rukh.damage).toBe(4);

                reset(false);

                // CASE 3: Rukh attacks into shield, ability doesn't trigger
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInLocation('ground arena');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.rukh.damage).toBe(3);

                reset();

                // CASE 4: Rukh attacks and target is killed by regular combat damage, ability naturally fizzles
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInLocation('discard');
                expect(context.rukh.damage).toBe(3);

                reset();

                // CASE 5: Rukh attacks base
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base).toBeInLocation('base');
                expect(context.p2Base.damage).toBe(3);

                reset();

                // CASE 6: Rukh dies while attacking, ability still triggers
                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInLocation('discard');
                expect(context.rukh).toBeInLocation('discard');
            });
        });
    });
});
