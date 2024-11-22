describe('Han Solo, Worth the Risk', function () {
    integration(function (contextRef) {
        describe('Han Solo\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-braggart', 'twin-pod-cloud-car'],
                        leader: 'han-solo#worth-the-risk',
                        resources: 4,
                    },
                });
            });

            it('should play a unit from our hand, it costs 1 resource less and take 2 damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.twinPodCloudCar]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.cantinaBraggart).toBeInZone('groundArena');
                expect(context.cantinaBraggart.damage).toBe(2);
                expect(context.hanSolo.exhausted).toBeTrue();

                context.hanSolo.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                // play automatically twin pod cloud car

                expect(context.twinPodCloudCar).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.hanSolo.exhausted).toBeTrue();
            });
        });

        describe('Han Solo\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-braggart', 'twin-pod-cloud-car'],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    },
                });
            });

            it('should play a unit from our hand, it costs 1 resource less and take 2 damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Attack');
                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.twinPodCloudCar]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.cantinaBraggart).toBeInZone('groundArena');
                expect(context.cantinaBraggart.damage).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                // play automatically twin pod cloud car

                expect(context.twinPodCloudCar).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.hanSolo.exhausted).toBeTrue();
            });
        });
    });
});
