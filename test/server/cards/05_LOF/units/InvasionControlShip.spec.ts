describe('Invasion Control Ship', function() {
    integration(function(contextRef) {
        describe('Invasion Control Ship\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['invasion-control-ship'],
                        spaceArena: ['swarming-vulture-droid'],
                        groundArena: ['wampa', 'viper-probe-droid'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'k2so#cassians-counterpart'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['vanquish'],
                    },
                });
            });

            it('should give Raid 2 to each friendly droid', function () {
                const { context } = contextRef;

                expect(context.swarmingVultureDroid.hasSomeKeyword('raid')).toBeFalse();
                expect(context.viperProbeDroid.hasSomeKeyword('raid')).toBeFalse();
                expect(context.k2so.hasSomeKeyword('raid')).toBeFalse();

                context.player1.clickCard(context.invasionControlShip);
                expect(context.swarmingVultureDroid.hasSomeKeyword('raid')).toBeTrue();
                expect(context.viperProbeDroid.hasSomeKeyword('raid')).toBeTrue();
                expect(context.k2so.hasSomeKeyword('raid')).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.viperProbeDroid);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5); // 3 + raid 2

                context.moveToNextActionPhase();
                expect(context.swarmingVultureDroid.hasSomeKeyword('raid')).toBeTrue();
                expect(context.viperProbeDroid.hasSomeKeyword('raid')).toBeTrue();
                expect(context.k2so.hasSomeKeyword('raid')).toBeFalse();

                context.player1.clickCard(context.swarmingVultureDroid);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(9); // 5 + 2 + raid 2

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.invasionControlShip);
                expect(context.swarmingVultureDroid.hasSomeKeyword('raid')).toBeFalse();
                expect(context.viperProbeDroid.hasSomeKeyword('raid')).toBeFalse();
                expect(context.k2so.hasSomeKeyword('raid')).toBeFalse();
            });
        });
    });
});