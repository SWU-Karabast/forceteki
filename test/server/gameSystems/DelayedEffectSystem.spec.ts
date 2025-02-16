describe('Delayed effects', function() {
    integration(function (contextRef) {
        describe('A delayed effect with duration "while source is in play" should', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
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

        it('A delayed effect with duration "while source is in play" should immediately activate if the source is defeated before the trigger resolves', async function() {
            await contextRef.setupTestAsync({
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

        describe('A delayed effect with duration "while source is in play", when the unique rule is triggered,', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        // 10 resources total
                        resources: [
                            'dj#blatant-thief', 'dj#blatant-thief', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        resources: 10
                    }
                });

                const { context } = contextRef;

                const [djInPlay, djInHand] = context.player1.findCardsByName('dj#blatant-thief');
                context.djInPlay = djInPlay;
                context.djInHand = djInHand;

                context.player1.clickCard(djInPlay);
                context.stolenResource1 = context.player1.resources.filter((resource) => resource.owner === context.player2Object)[0];
                context.player2.passAction();
                context.player1.readyResources(7);

                // set an explicit random seed so we can guarantee that different "random" cards are stolen between the two DJs
                context.game.setRandomSeed('12345');
            });

            it('should activate if the in-play card is defeated', function() {
                const { context } = contextRef;

                // play DJ from hand, defeat the DJ in play
                context.player1.clickCard(context.djInHand);
                context.player1.clickCard(context.djInPlay);

                // since a new DJ came in, the original resource was returned and a new one was stolen
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                const stolenResource2 = context.player1.resources.filter((resource) => resource.owner === context.player2Object)[0];
                expect(context.stolenResource1).not.toBe(stolenResource2);
            });

            it('should immediately activate if the from-hand card is defeated', function() {
                const { context } = contextRef;

                // play DJ from hand, defeat that same DJ
                context.player1.clickCard(context.djInHand);
                context.player1.clickCard(context.djInHand);

                // since the new one was defeated, the newly stolen resource goes back immediately
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                const stolenResource2 = context.player1.resources.filter((resource) => resource.owner === context.player2Object)[0];
                expect(context.stolenResource1).toBe(stolenResource2);
            });
        });
    });
});
