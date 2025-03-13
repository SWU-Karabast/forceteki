describe('Piercing Shot', function () {
    integration(function (contextRef) {
        describe('Piercing Shot\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['piercing-shot'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['shield', 'shield'] }],
                    }
                });
            });

            it('should defeat all shield tokens of a unit and deal 3 damage to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.piercingShot);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.isUpgraded()).toBeFalse();
                expect(context.atst.damage).toBe(3);
            });

            it('should defeat all shield tokens of a unit and deal 3 damage to it (no shield)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.piercingShot);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(3);
            });
        });
    });
});
