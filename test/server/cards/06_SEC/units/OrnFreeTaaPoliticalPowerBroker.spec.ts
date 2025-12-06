describe('Orn Free Taa, Political Power Broker', function() {
    integration(function(contextRef) {
        it('Orn Free Taa when played ability should search the top 10 card of his deck for a Law card, reveal it and draw it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['orn-free-taa#political-power-broker'],
                    deck: ['confiscate', 'wampa', 'imprisoned', 'ambitions-reward', 'atst', 'awing', 'green-squadron-awing', 'phoenix-squadron-awing', 'yoda#old-master', 'arrest', 'convene-the-senate']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ornFreeTaa);

            expect(context.player1).toHaveExactDisplayPromptCards({
                invalid: [context.wampa, context.atst, context.awing, context.yoda, context.phoenixSquadronAwing, context.greenSquadronAwing],
                selectable: [context.confiscate, context.imprisoned, context.ambitionsReward, context.arrest]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.confiscate);
            expect(context.getChatLogs(2)).toContain('player1 takes Confiscate');
            expect(context.confiscate).toBeInZone('hand');

            expect(context.wampa).toBeInBottomOfDeck(context.player1, 9);
            expect(context.atst).toBeInBottomOfDeck(context.player1, 9);
            expect(context.awing).toBeInBottomOfDeck(context.player1, 9);
            expect(context.yoda).toBeInBottomOfDeck(context.player1, 9);
            expect(context.phoenixSquadronAwing).toBeInBottomOfDeck(context.player1, 9);
            expect(context.greenSquadronAwing).toBeInBottomOfDeck(context.player1, 9);
            expect(context.imprisoned).toBeInBottomOfDeck(context.player1, 9);
            expect(context.ambitionsReward).toBeInBottomOfDeck(context.player1, 9);
            expect(context.arrest).toBeInBottomOfDeck(context.player1, 9);
        });

        it('Orn Free Taa constant ability should gains +1/+0 for each Law card in his discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['orn-free-taa#political-power-broker'],
                    discard: ['confiscate', 'wampa', 'imprisoned', 'ambitions-reward', 'atst']
                },
                player2: {
                    discard: ['arrest']
                }
            });

            const { context } = contextRef;

            expect(context.ornFreeTaa.getPower()).toBe(3);
            expect(context.ornFreeTaa.getHp()).toBe(4);

            context.player1.clickCard(context.ornFreeTaa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
