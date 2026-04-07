describe('Jendirian Valley, Refugee Freighter', function() {
    integration(function(contextRef) {
        it('Jendirian Valley\'s ability should search the top 8 cards of your deck for a card and resource it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jenridian-valley#refugee-freighter'],
                    deck: ['wampa', 'atst', 'awing', 'mastery', 'protector', 'battlefield-marine', 'green-squadron-awing', 'yoda#old-master', 'gungi#finding-himself'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'echo-base'
                },
            });

            const { context } = contextRef;

            const initialResourceCount = context.player1.resources.length;
            context.player1.clickCard(context.jenridianValley);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.atst, context.awing, context.mastery, context.protector, context.battlefieldMarine, context.greenSquadronAwing, context.yoda],
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            expect(context.getChatLog().includes('wampa')).toBeFalse();

            expect(context.player2).toBeActivePlayer();

            expect(context.player1.resources.length).toBe(initialResourceCount + 1);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            expect(context.wampa).toBeInZone('resource', context.player1);
            expect([context.atst, context.awing, context.mastery, context.protector, context.battlefieldMarine, context.greenSquadronAwing, context.yoda]).toAllBeInBottomOfDeck(context.player1, 7);
        });
    });
});
