describe('Strike Force X-Wing', function () {
    integration(function (contextRef) {
        it('Strike Force X-Wing\'s when played ability should deal 2 damage to a ready unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['strike-force-xwing'],
                    groundArena: ['battlefield-marine', { card: 'specforce-soldier', exhausted: true }],
                    resources: 10
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', exhausted: true }],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.strikeForceXwing);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
        });

        it('Strike Force X-Wing\'s when played ability should deal 2 damage to a ready unit (from plot)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: [
                        'strike-force-xwing', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    ],
                    leader: 'cassian-andor#dedicated-to-the-rebellion',
                    groundArena: [{ card: 'specforce-soldier', exhausted: true }],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', exhausted: true }],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.cassianAndor);
            context.player1.clickPrompt('Deploy Cassian Andor');
            expect(context.player1).toHavePassAbilityPrompt('Play Strike Force X-Wing using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.cassianAndor, context.wampa, context.awing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
        });
    });
});
