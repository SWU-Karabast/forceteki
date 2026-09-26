describe('Teebo Striped Hunter', function() {
    integration(function(contextRef) {
        it('should give Hidden to other friendly Ewok units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wicket#yub-nub'],
                    groundArena: ['teebo#striped-hunter'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wicket);
            context.player2.clickCard(context.atst);

            expect(context.player2).toBeAbleToSelectExactly([context.teebo, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });


        it('should not give Hidden to non-Ewok friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    groundArena: ['teebo#striped-hunter'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.atst);

            expect(context.player2).toBeAbleToSelectExactly([context.teebo, context.battlefieldMarine, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});
