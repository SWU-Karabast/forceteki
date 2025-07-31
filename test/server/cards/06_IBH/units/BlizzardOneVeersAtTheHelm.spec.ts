describe('Blizzard One Veers At The Helm', function() {
    integration(function(contextRef) {
        it('Blizzard One\'s ability should allow defeating a non-leader ground unit with 3 or less remaining HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blizzard-one#veers-at-the-helm'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [
                        'sundari-peacekeeper',
                        { card: 'wampa', damage: 2 }
                    ],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            // Play Blizzard One
            context.player1.clickCard(context.blizzardOneVeersAtTheHelm);
            expect(context.blizzardOneVeersAtTheHelm).toBeInZone('groundArena');

            // Only the Wampa (with 3 or less HP) should be selectable
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            // Select the Wampa
            context.player1.clickCard(context.wampa);

            // Verify Wampa is defeated
            expect(context.wampa).toBeInZone('discard');
        });
    });
});