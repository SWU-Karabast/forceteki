describe('Death by Droids', function () {
    integration(function (contextRef) {
        describe('Death by Droids ability', function () {
            it('should defeat a unit that cost 3 or less and create 2 Battle Droid tokens', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['death-by-droids'],
                        groundArena: ['fifth-brother#fear-hunter', 'kanan-jarrus#revealed-jedi']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.deathByDroids);
                expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.greenSquadronAwing]);

                // Defeat a unit that costs 3 or less
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toBeInZone('discard');

                // Create 2 Battle Droid tokens
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });

            it('should only create 2 Battle Droid tokens as there is no elegible units in play to defeat', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['death-by-droids'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.deathByDroids);
                expect(context.player2).toBeActivePlayer();

                // Create 2 Battle Droid tokens
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});
