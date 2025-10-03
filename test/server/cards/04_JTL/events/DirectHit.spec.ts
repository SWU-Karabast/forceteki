describe('Direct Hit', function() {
    integration(function(contextRef) {
        it('Direct Hit\'s ability should defeat any non-leader Vehicle unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['direct-hit'],
                    groundArena: ['pyke-sentinel', 'atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['imperial-interceptor'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.directHit);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);

            context.player1.clickCard(context.imperialInterceptor);
            expect(context.imperialInterceptor).toBeInZone('discard');
        });

        it('cannot target a leader Vehicle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'boba-fett#any-methods-necessary',
                    spaceArena: ['cartel-spacer', 'auzituck-liberator-gunship'],
                    resources: 6
                },
                player2: {
                    hand: ['direct-hit'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFett);
            context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
            context.player1.clickCard(context.auzituckLiberatorGunship);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.auzituckLiberatorGunship]);

            // TODO: why is there no way to hit 'done' here?
            context.player1.setDistributeDamagePromptState(new Map([
            ]));

            context.player2.clickCard(context.directHit);
            expect(context.player2).not.toBeAbleToSelect(context.auzituckLiberatorGunship);
            context.player2.clickCard(context.cartelSpacer);
        });
    });
});
