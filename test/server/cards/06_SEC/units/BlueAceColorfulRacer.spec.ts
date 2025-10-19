describe('Blue Ace, Colorful Racer', function () {
    integration(function (contextRef) {
        it('Blue Ace\'s on attach ability must ready an exhausted enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'atst', exhausted: true }],
                    spaceArena: ['blue-ace#colorful-racer']
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    spaceArena: ['adelphi-patrol-wing', { card: 'tieln-fighter', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blueAceColorfulRacer);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.wampa]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeFalse();
        });

        it('Blue Ace\'s on attach ability must ready an exhausted enemy unit (if any)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blue-ace#colorful-racer']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing', 'tieln-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blueAceColorfulRacer);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
