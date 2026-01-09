describe('Dengar, Take Your Shot', function () {
    integration(function (contextRef) {
        describe('Dengar\'s triggered ability', function () {
            it('TODO', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'data-vault',
                        hand: [
                            'overwhelming-barrage',
                            'open-fire',
                            'bombing-run'
                        ],
                        groundArena: [
                            'dengar#take-your-shot'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'queen-amidala#championing-her-people',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                expect(context.player1.credits).toBe(0);

                // Play Overwhelming Barrage on Dengar to defeat Queen Amidala & Battlefield Marine
                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.dengar);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.queenAmidala, 3],
                    [context.battlefieldMarine, 3]
                ]));

                // Dengar should get a Credit token since Queen Amidala was the highest cost enemy unit
                expect(context.player1.credits).toBe(1);
            });
        });
    });
});