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

        describe('Buy Time with Moff Jerjerrod', function () {
            it('should give Sentinel to both of the doubled Mandalorian tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['buy-time'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.buyTime);
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Mandalorian tokens instead');
                context.player1.clickPrompt('Trigger');

                // Both doubled Mandalorian tokens have Shielded, so their triggers must be ordered
                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Shielded');

                const mandalorians = context.player1.findCardsByName('mandalorian', 'groundArena');
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(mandalorians.length).toBe(2);
                expect(mandalorians.every((mandalorian) => mandalorian.keywords.some((keyword) => keyword.name === 'sentinel'))).toBe(true);

                // Opponent must attack a Sentinel this phase
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly(mandalorians);
                context.player2.clickCard(mandalorians[0]);
            });
        });
    });
});