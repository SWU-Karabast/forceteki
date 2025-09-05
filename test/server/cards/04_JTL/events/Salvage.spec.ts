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

        it('Salvage shoul be able to target a friendly Stolen AT-Hauler that was defeated this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: false,
                    hand: ['salvage'],
                    spaceArena: ['stolen-athauler'],
                    discard: ['cartel-spacer'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;

            // Player 2 uses Takedown to defeat the AT-Hauler
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.stolenAthauler);

            expect(context.stolenAthauler).toBeInZone('discard', context.player1);

            // Player 1 plays Salvage from to play Stolen AT-Hauler from their discard pile
            context.player1.clickCard(context.salvage);
            expect(context.player1).toBeAbleToSelectExactly([context.stolenAthauler, context.cartelSpacer]);
            context.player1.clickCard(context.stolenAthauler);

            expect(context.player2).toBeActivePlayer();
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);
            expect(context.stolenAthauler.damage).toBe(1);
        });
    });
});
