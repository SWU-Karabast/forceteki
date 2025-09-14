describe('When Has Become Now', function() {
    integration(function(contextRef) {
        it('When Has Become Now\'s ability should play a Plot card from resources, then puts the top card of your deck into play as a resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['when-has-become-now'],
                    resources: [
                        'sneaking-suspicion', 'armor-of-fortune', 'dogmatic-shock-squad', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
                    ],
                    deck: ['pyke-sentinel'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.whenHasBecomeNow);
            expect(context.player1).toBeAbleToSelectExactly([context.sneakingSuspicion, context.armorOfFortune, context.dogmaticShockSquad]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.dogmaticShockSquad);

            expect(context.player2).toBeActivePlayer();
            expect(context.dogmaticShockSquad).toBeInZone('groundArena');
            expect(context.pykeSentinel).toBeInZone('resource', context.player1);
        });
    });
});
