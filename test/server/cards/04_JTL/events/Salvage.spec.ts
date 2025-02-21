describe('Salvage', function() {
    integration(function(contextRef) {
        it('Salvage\'s ability should play a Vehicle unit from your discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvage'],
                    discard: ['lurking-tie-phantom', 'cartel-spacer', 'atst', 'crafty-smuggler'],
                    leader: 'doctor-aphra#rapacious-archaeologist',
                    base: 'echo-base'
                },
                player2: {
                    discard: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.salvage);
            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.atst, context.cartelSpacer]);

            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.player2).toBeActivePlayer();
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(1);
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });
    });
});
