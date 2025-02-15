describe('Admiral Holdo, We\'re Not Alone', function () {
    integration(function (contextRef) {
        describe('Admiral Holdo\'s undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-holdo#were-not-alone',
                        groundArena: ['rey#keeping-the-past', 'battlefield-marine'],
                        spaceArena: ['dqar-cargo-frigate'],
                        resources: 2
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise']
                    }
                });
            });

            it('should give +2/+2 for the phase to a resistance unit or a unit with a resistance upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralHoldo);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.rey, context.dqarCargoFrigate]);
                context.player1.clickCard(context.rey);

                expect(context.rey.getPower()).toBe(6);
                expect(context.rey.getHp()).toBe(9);

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.admiralHoldo.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                expect(context.rey.getPower()).toBe(4);
                expect(context.rey.getHp()).toBe(7);
            });

            // TODO WHEN PILOTING IS DONE ADD RESISTANCE UPGRADE TESTS
        });

        describe('Admiral Holdo\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'admiral-holdo#were-not-alone', deployed: true },
                        groundArena: ['rey#keeping-the-past', 'battlefield-marine'],
                        spaceArena: ['dqar-cargo-frigate'],
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise']
                    }
                });
            });

            it('may give +2/+2 for the phase to a resistance unit or a unit with a resistance upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralHoldo);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.rey, context.dqarCargoFrigate]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.rey);

                expect(context.rey.getPower()).toBe(6);
                expect(context.rey.getHp()).toBe(9);

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                expect(context.rey.getPower()).toBe(4);
                expect(context.rey.getHp()).toBe(7);
            });

            // TODO WHEN PILOTING IS DONE ADD RESISTANCE UPGRADE TESTS
        });
    });
});
