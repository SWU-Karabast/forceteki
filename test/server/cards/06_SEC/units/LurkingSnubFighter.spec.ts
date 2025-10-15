describe('Lurking Snub Fighter', function () {
    integration(function (contextRef) {
        it('Lurking Snub Fighter\'s when played ability may exhaust a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lurking-snub-fighter'],
                    spaceArena: ['adelphi-patrol-wing']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lurkingSnubFighter);

            expect(context.player1).toBeAbleToSelectExactly([context.lurkingSnubFighter, context.adelphiPatrolWing, context.tielnFighter, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.tielnFighter);

            expect(context.player2).toBeActivePlayer();
            expect(context.tielnFighter.exhausted).toBeTrue();
        });

        it('Lurking Snub Fighter\'s when played ability may exhaust a unit (plot)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: ['lurking-snub-fighter', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    spaceArena: ['adelphi-patrol-wing'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jangoFett);
            context.player1.clickPrompt('Deploy Jango Fett');
            expect(context.player1).toHavePassAbilityPrompt('Play Lurking Snub Fighter using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.lurkingSnubFighter, context.adelphiPatrolWing, context.tielnFighter, context.jangoFett, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.tielnFighter);

            expect(context.player2).toBeActivePlayer();
            expect(context.tielnFighter.exhausted).toBeTrue();
        });
    });
});
