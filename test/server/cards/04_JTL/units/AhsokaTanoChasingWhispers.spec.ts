describe('Ahsoka Tano, Chasing Whispers', function() {
    integration(function(contextRef) {
        it('Ahsoka Tano\'s ability should exhaust a unit if the opponent discarded a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['ahsoka-tano#chasing-whispers'],
                },
                player2: {
                    groundArena: ['atst'],
                    hand: ['restored-arc170'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);
            expect(context.player2).toBeAbleToSelectExactly(context.restoredArc170);
            context.player2.clickCard(context.restoredArc170);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.ahsokaTano]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.atst);
            expect(context.atst.exhausted).toBe(true);

            expect(context.getChatLogs(2)).toEqual([
                'player1 uses Ahsoka Tano to make player2 discard a card',
                'player2 discards Restored ARC-170',
            ]);
        });

        it('Ahsoka Tano\'s ability should do nothing when opponent\'s hand is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['ahsoka-tano#chasing-whispers'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);
            expect(context.player2).toBeActivePlayer();
        });

        it('Ahsoka Tano\'s ability should not exhaust a unit if the opponent didn\'t discard a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['ahsoka-tano#chasing-whispers'],
                },
                player2: {
                    groundArena: ['atst'],
                    hand: ['protector'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);
            expect(context.player2).toBeAbleToSelectExactly(context.protector);
            context.player2.clickCard(context.protector);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
