describe('Grand Admiral Thrawn, Orchestrating His Return', function() {
    integration(function(contextRef) {
        it('should ready him if the defender is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grand-admiral-thrawn#orchestrating-his-return', { card: 'rebel-pathfinder', exhausted: true }],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['crafty-smuggler', 'battlefield-marine', 'atst'],
                    spaceArena: ['wing-leader']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandAdmiralThrawn);
            context.player1.clickCard(context.craftySmuggler);
            expect(context.craftySmuggler).toBeInZone('discard', context.player2);
            expect(context.grandAdmiralThrawn.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();

            context.player2.passAction();

            context.player1.clickCard(context.grandAdmiralThrawn);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.grandAdmiralThrawn.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('should not ready if a friendly unit attacks and defeats', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grand-admiral-thrawn#orchestrating-his-return', { card: 'rebel-pathfinder', exhausted: true }],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['crafty-smuggler', 'battlefield-marine', 'atst'],
                    spaceArena: ['wing-leader']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lurkingSnubFighter);
            context.player1.clickCard(context.wingLeader);
            expect(context.wingLeader).toBeInZone('discard', context.player2);
            expect(context.grandAdmiralThrawn.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingSnubFighter.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('should not ready if he does not defeat', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grand-admiral-thrawn#orchestrating-his-return', { card: 'rebel-pathfinder', exhausted: true }],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['crafty-smuggler', 'battlefield-marine', 'atst'],
                    spaceArena: ['wing-leader']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandAdmiralThrawn);
            context.player1.clickCard(context.atst);
            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.grandAdmiralThrawn.exhausted).toBeTrue();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingSnubFighter.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('should ready friendly unit when using the support attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-admiral-thrawn#orchestrating-his-return'],
                    groundArena: [{ card: 'rebel-pathfinder', exhausted: true }],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['crafty-smuggler', 'battlefield-marine', 'atst'],
                    spaceArena: ['wing-leader']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandAdmiralThrawn);
            context.player1.clickCard(context.lurkingSnubFighter);
            context.player1.clickCard(context.wingLeader);
            expect(context.wingLeader).toBeInZone('discard', context.player2);
            expect(context.grandAdmiralThrawn.exhausted).toBeTrue();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingSnubFighter.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });
    });
});