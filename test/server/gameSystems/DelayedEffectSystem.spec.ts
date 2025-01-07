describe('Delayed effects', function() {
    integration(function (contextRef) {
        describe('A delayed effect with duration "while source is in play" should', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        // 10 resources total
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        hand: ['vanquish', 'discerning-veteran', 'waylay', 'change-of-heart'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // play out DJ and steal a resource
                context.player1.clickCard(context.dj);
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
            });

            it('trigger when the source card is defeated', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });

            it('trigger when when the source is captured', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });

            it('trigger when the source is returned to hand', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });

            it('persist across rounds', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });

            it('persist even if the source changes controllers', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.dj);

                context.player1.passAction();
                context.player2.readyResources(10);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });
        });

        it('A delayed effect with duration "while source is in play" should immediately activate if the source is defeated before the trigger resolves', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    leader: 'han-solo#audacious-smuggler',
                    // 10 resources total
                    resources: [
                        'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['supreme-leader-snoke#shadow-ruler', 'krayt-dragon'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            // play out DJ and assign Krayt damage to him - between that and Snoke effect he is defeated before ability resolves
            context.player1.clickCard(context.dj);
            context.player1.clickPrompt('Opponent');
            context.player2.clickCard(context.dj);

            // the resource should be returned to the opponent immediately
            expect(context.player1.resources.length).toBe(10);
            expect(context.player2.resources.length).toBe(10);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
