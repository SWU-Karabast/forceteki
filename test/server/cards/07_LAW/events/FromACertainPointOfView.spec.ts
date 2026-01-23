describe('From a Certain Point of View', function() {
    integration(function(contextRef) {
        describe('From a Certain Point of View\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['from-a-certain-point-of-view', 'wampa', 'vanquish', 'jedi-lightsaber'],
                        leader: 'leia-organa#alliance-general',
                        base: 'echo-base',
                        groundArena: ['atst'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should play a unit from hand ignoring aspect penalties', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fromACertainPointOfView);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.vanquish, context.jediLightsaber]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena');
                // 1 for From a Certain Point of View + 4 for Wampa (no aspect penalty)
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow playing an event from hand ignoring aspect penalties', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fromACertainPointOfView);
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.vanquish).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow playing an upgrade from hand ignoring aspect penalties', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fromACertainPointOfView);
                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber']);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should do nothing when choosing nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['from-a-certain-point-of-view', 'wampa'],
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fromACertainPointOfView);
            context.player1.clickPrompt('Choose nothing');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand');
            expect(context.fromACertainPointOfView).toBeInZone('discard');
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
