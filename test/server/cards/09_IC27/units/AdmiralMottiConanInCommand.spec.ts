describe('Admiral Motti, Conan in Command', function() {
    integration(function(contextRef) {
        it('Motti\'s On Attack ability should give an Experience token to each other friendly Imperial unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['admiral-motti#conan-in-command', 'atst', 'death-star-stormtrooper', 'wampa'],
                },
                player2: {
                    groundArena: ['reinforcement-walker'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.admiralMotti);
            context.player1.clickCard(context.p2Base);

            // Imperial units get an Experience token
            expect(context.atst).toHaveExactUpgradeNames(['experience']);
            expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['experience']);

            // Motti itself, non-Imperial friendly units and enemy Imperial units do not
            expect(context.admiralMotti).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);

            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Motti\'s On Attack ability should do nothing if there are no other friendly Imperial units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['admiral-motti#conan-in-command', 'wampa', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.admiralMotti);
            context.player1.clickCard(context.p2Base);

            expect(context.admiralMotti).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);

            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
