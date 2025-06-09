describe('Lightsaber Throw', function () {
    integration(function (contextRef) {
        describe('Lightsaber Throw\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lightsaber-throw', 'fallen-lightsaber', 'alliance-xwing'],
                        groundArena: ['wild-rancor'],
                        deck: ['rebel-pathfinder']
                    },
                    player2: {
                        groundArena: ['steadfast-battalion'],
                    },
                });
            });

            it('should deal 4 damage to a friendly unit after player discards lightsaber', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lightsaberThrow);
                context.player1.clickCard(context.fallenLightsaber);

                context.player1.clickCard(context.wildRancor);
                expect(context.fallenLightsaber).toBeInZone('discard');
                expect(context.rebelPathfinder).toBeInZone('hand');
                expect(context.wildRancor.damage).toBe(4);
            });

            it('should deal 4 damage to an enemy unit after player discards lightsaber', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lightsaberThrow);
                context.player1.clickCard(context.fallenLightsaber);

                context.player1.clickCard(context.steadfastBattalion);
                expect(context.fallenLightsaber).toBeInZone('discard');
                expect(context.rebelPathfinder).toBeInZone('hand');
                expect(context.steadfastBattalion.damage).toBe(4);
            });
        });

        it('Lightsaber Throw\'s ability should allow choosing nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'lightsaber-throw', 'fallen-lightsaber'],
                    resources: 5,
                    discard: ['timely-intervention', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lightsaberThrow);
            context.player1.clickPrompt('Choose Nothing');

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing when nothing available in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'lightsaber-throw'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst'],
                    deck: ['rebel-pathfinder']
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lightsaberThrow);

            expect(context.player1).toBeAbleToSelectNoneOf([context.poeDameron, context.wampa]);

            expect(context.rebelPathfinder).toBeInZone('deck');
            expect(context.poeDameron).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to discard and draw even if there are no damage targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'fallen-lightsaber', 'lightsaber-throw'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst', 'jedi-knight'],
                    deck: ['rebel-pathfinder']
                },
                player2: {
                    hand: ['timely-intervention']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lightsaberThrow);

            context.player1.clickCard(context.fallenLightsaber);

            expect(context.rebelPathfinder).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });
    });
});