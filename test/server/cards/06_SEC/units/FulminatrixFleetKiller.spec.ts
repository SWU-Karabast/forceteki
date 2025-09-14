describe('Fulminatrix, Fleet Killer', function() {
    integration(function(contextRef) {
        it('Fulminatrix\'s when played ability should optionally deal 4 damage to a ground unit when played (Trigger chosen)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fulminatrix#fleet-killer'],
                    groundArena: ['first-legion-snowtrooper']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fulminatrix);

            expect(context.player1).toBeAbleToSelectExactly([context.firstLegionSnowtrooper, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('Fulminatrix\'s on attack ability should optionally deal 4 damage to a ground unit when it attacks (Trigger chosen)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['fulminatrix#fleet-killer'],
                    groundArena: ['first-legion-snowtrooper']
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fulminatrix);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.firstLegionSnowtrooper, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(4);
        });
    });
});