
describe('Sanctioners Shuttle', function() {
    integration(function(contextRef) {
        it('should capture an enemy non-leader unit that costs 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sanctioners-shuttle'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['padawan-starfighter'],
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'subjugating-starfighter', { card: 'trade-federation-shuttle', damage: 2 }]
                }

            });

            const { context } = contextRef;

            // Play Sanctioners Shuttle, capture a unit that costs less than 3
            context.player1.clickCard(context.sanctionersShuttle);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.tradeFederationShuttle]);
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing).toBeCapturedBy(context.sanctionersShuttle);
            expect(context.getChatLogs(2)).toContain('player1 uses Sanctioner\'s Shuttle to capture Green Squadron A-Wing');

            // Remove coordinate
            context.player2.clickCard(context.subjugatingStarfighter);
            context.player2.clickCard(context.padawanStarfighter);

            context.moveToNextActionPhase();

            // Reset unit to hand
            context.player1.clickCard(context.sanctionersShuttle);
            context.player1.clickCard(context.tradeFederationShuttle);
            context.player1.moveCard(context.sanctionersShuttle, 'hand');

            context.player2.passAction();

            context.player1.clickCard(context.sanctionersShuttle);
            expect(context.sanctionersShuttle).toBeInZone('spaceArena');
        });
    });
});
