describe('Darth Vader, Meet Your Destiny', function () {
    integration(function (contextRef) {
        it('Darth Vader\'s ability should not give him Sentinel when exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-vader#meet-your-destiny'],
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }]
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            expect(context.darthVader.hasSomeKeyword('sentinel')).toBeFalse();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.darthVader, context.yoda, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
        });

        it('Darth Vader\'s ability should give him Sentinel when ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }, 'darth-vader#meet-your-destiny']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            expect(context.darthVader.hasSomeKeyword('sentinel')).toBeTrue();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.darthVader]);
            context.player2.clickCard(context.darthVader);

            expect(context.player1).toBeActivePlayer();
        });
    });
});