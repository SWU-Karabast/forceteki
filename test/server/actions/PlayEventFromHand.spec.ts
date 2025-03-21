describe('Play event from hand', function() {
    integration(function(contextRef) {
        describe('When an event is played', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('it should end up in discard and resources should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.daringRaid).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // play a second event with an aspect penalty
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.wampa);

                expect(context.repair).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });


        it('When an event is played, it can be cancelled and then triggered successfully', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tactical-advantage'],
                    groundArena: ['pyke-sentinel']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tacticalAdvantage);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');

            context.player1.clickPrompt('Cancel');
            expect(context.player1).toBeActivePlayer();
            expect(context.tacticalAdvantage).toBeInZone('hand');
            expect(context.player1.exhaustedResourceCount).toBe(0);

            context.player1.clickCard(context.tacticalAdvantage);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');

            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel.getPower()).toBe(4);
            expect(context.pykeSentinel.getHp()).toBe(5);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.pykeSentinel);
            expect(context.wampa.damage).toBe(4);
            expect(context.pykeSentinel.damage).toBe(4);
            expect(context.pykeSentinel).toBeInZone('groundArena');
        });
    });
});
