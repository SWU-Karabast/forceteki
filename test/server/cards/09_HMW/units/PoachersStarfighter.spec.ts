describe('Poacher\'s Starfighter', function () {
    integration(function (contextRef) {
        it('Poacher\'s Starfighter\'s when played should defeat it, create a Beast, and deal 1 damage to it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poachers-starfighter'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poachersStarfighter);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);
            expect(p1Beast.damage).toBe(1);

            expect(context.poachersStarfighter).toBeInZone('discard');
        });

        it('Poacher\'s Starfighter\'s when played should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poachers-starfighter'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poachersStarfighter);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(0);

            expect(context.poachersStarfighter).toBeInZone('spaceArena');
        });
    });
});