describe('Corrupt Politician', function() {
    integration(function(contextRef) {
        it('Corrupt Politician\'s ability should gain Sentinel when controlling more units than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['corrupt-politician', 'battlefield-marine', 'wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            expect(context.player2).toBeAbleToSelectExactly([context.corruptPolitician]);
            context.player2.clickCard(context.corruptPolitician);
        });

        it('Corrupt Politician\'s ability should not have Sentinel when controlling equal or fewer units than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['corrupt-politician']
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            expect(context.player2).toBeAbleToSelectExactly([context.corruptPolitician, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});