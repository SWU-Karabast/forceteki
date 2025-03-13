describe('Resistance Blue Squadron', function () {
    integration(function (contextRef) {
        it('Resistance Blue Squadron\'s ability should deal 1 damage for being the only friendly space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resistance-blue-squadron'],
                    groundArena: ['liberated-slaves']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resistanceBlueSquadron);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the number of friendly space units');
            expect(context.player1).toBeAbleToSelectExactly([
                context.resistanceBlueSquadron,
                context.liberatedSlaves,
                context.greenSquadronAwing,
                context.battlefieldMarine
            ]);

            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('ResistanceBlueSquadron\'s ability should deal damage to the amount of friendly space units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resistance-blue-squadron'],
                    groundArena: ['liberated-slaves'],
                    spaceArena: ['cartel-turncoat', 'collections-starhopper']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['adelphi-patrol-wing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resistanceBlueSquadron);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the number of friendly space units');
            expect(context.player1).toBeAbleToSelectExactly([
                context.resistanceBlueSquadron,
                context.liberatedSlaves,
                context.cartelTurncoat,
                context.collectionsStarhopper,
                context.adelphiPatrolWing,
                context.battlefieldMarine
            ]);

            context.player1.clickCard(context.adelphiPatrolWing);

            expect(context.adelphiPatrolWing.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});