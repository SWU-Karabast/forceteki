describe('Jabba\'s Rancor, Snack Time', function() {
    integration(function(contextRef) {
        it('Jabba\'s Rancor\'s on attack ability may deal 7 damage a ground unit (depending on opponent choice)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['grey-squadron-ywing'],
                    groundArena: ['jabbas-rancor#snack-time'],
                },
                player2: {
                    groundArena: ['jabba-the-hutt#cunning-daimyo', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jabbasRancor);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toHavePrompt('Choose a ground unit. Your opponent may deal 7 damage to it');
            expect(context.player2).toBeAbleToSelectExactly([context.jabbaTheHutt, context.wampa]);

            context.player2.clickCard(context.jabbaTheHutt);
            expect(context.player1).toHavePassAbilityPrompt('Deal 7 damage to Jabba The Hutt');

            context.player1.clickPrompt('Trigger');
            expect(context.jabbaTheHutt.damage).toEqual(7);
        });

        it('Jabba\'s Rancor\'s on attack ability does nothing (and does not throw) if the opponent controls no ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jabbas-rancor#snack-time'],
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jabbasRancor);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(7);
            expect(context.lurkingTiePhantom.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
