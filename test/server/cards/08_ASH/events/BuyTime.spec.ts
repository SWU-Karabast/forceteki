describe('Buy Time', function () {
    integration(function (contextRef) {
        describe('Buy Time\'s ability', function () {
            it('should create a Mandalorian token when played and give it Sentinel for the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['buy-time'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.buyTime);
                expect(context.player2).toBeActivePlayer();

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0].exhausted).toBeTrue();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([mandalorians[0]]);
                context.player2.clickCard(mandalorians[0]);

                expect(context.player1).toBeActivePlayer();
            });

            it('should create a Mandalorian token when played and give it Sentinel for the phase (move to next action phase)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['buy-time'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.buyTime);
                expect(context.player2).toBeActivePlayer();

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0].exhausted).toBeTrue();

                context.moveToNextActionPhase();

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([mandalorians[0], context.p1Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});