describe('Scion Shuttle, At Morgan\'s Bidding', function() {
    integration(function(contextRef) {
        it('should give the defending unit -1/-1 while attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['scion-shuttle#at-morgans-bidding']
                },
                player2: {
                    spaceArena: [{ card: 'green-squadron-awing', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.scionShuttle);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.scionShuttle.damage).toBe(0);
            expect(context.greenSquadronAwing).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should give the defending unit -1/-1 during the attack initiated by Support', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['scion-shuttle#at-morgans-bidding'],
                    spaceArena: ['awing']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.scionShuttle);
            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.awing.damage).toBe(0);
            expect(context.greenSquadronAwing).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
