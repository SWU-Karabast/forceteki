describe('Flight of the Inquisitor', function () {
    integration(function (contextRef) {
        describe('Flight of the Inquisitor\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['flight-of-the-inquisitor'],
                        groundArena: ['wild-rancor'],
                        discard: ['fallen-lightsaber', 'alliance-xwing', 'fifth-brother#fear-hunter']
                    },
                    player2: {
                        groundArena: ['steadfast-battalion'],
                        discard: [
                            'vernestra-rwoh#precocious-knight',
                            'youngling-padawan'
                        ]
                    },
                });
            });

            it('should return a Force unit and Lightsaber upgrade from discard to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.flightOfTheInquisitor);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).not.toBeAbleToSelect([context.allianceXwing]);
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.fallenLightsaber);

                expect(context.fallenLightsaber).toBeInZone('hand');
                expect(context.fifthBrother).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should make you choose both if both are there', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.flightOfTheInquisitor);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.fifthBrother);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.fallenLightsaber);

                expect(context.fallenLightsaber).toBeInZone('hand');
                expect(context.fifthBrother).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Flight of the Inquisitor\'s ability should allow choosing only Lightsaber if only card available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'flight-of-the-inquisitor'],
                    discard: ['timely-intervention', 'fallen-lightsaber', 'jedi-lightsaber'],
                },
                player2: {
                    groundArena: ['rugged-survivors'],
                    discard: [
                        'vernestra-rwoh#precocious-knight',
                        'youngling-padawan'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flightOfTheInquisitor);
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.fallenLightsaber, context.jediLightsaber]);
            context.player1.clickCard(context.fallenLightsaber);

            expect(context.fallenLightsaber).toBeInZone('hand');
            expect(context.jediLightsaber).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow choosing Force unit if only card available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'flight-of-the-inquisitor'],
                    discard: ['atst', 'fifth-brother#fear-hunter', 'jedi-knight'],
                    deck: ['rebel-pathfinder']
                },
                player2: {
                    groundArena: ['rugged-survivors'],
                    discard: [
                        'vernestra-rwoh#precocious-knight',
                        'youngling-padawan'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flightOfTheInquisitor);
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.jediKnight]);
            context.player1.clickCard(context.fifthBrother);

            expect(context.fifthBrother).toBeInZone('hand');
            expect(context.jediKnight).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be played even if there are no valid targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'fallen-lightsaber', 'flight-of-the-inquisitor'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst'],
                    deck: ['rebel-pathfinder']
                },
                player2: {
                    hand: ['timely-intervention'],
                    discard: [
                        'vernestra-rwoh#precocious-knight',
                        'youngling-padawan'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flightOfTheInquisitor);

            expect(context.player2).toBeActivePlayer();
        });
    });
});