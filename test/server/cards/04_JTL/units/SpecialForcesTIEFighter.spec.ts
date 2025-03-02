
describe('Special Forces TIE Fighter', function() {
    integration(function(contextRef) {
        it('Special Forces TIE Fighter\'s ability should ready the unit for controlling fewer units in the space arena', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['special-forces-tie-fighter'],
                    groundArena: ['war-juggernaut', 'pyke-sentinel']
                },
                player2: {
                    groundArena: ['first-legion-snowtrooper'],
                    spaceArena: ['imperial-interceptor', 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.specialForcesTieFighter);

            expect(context.specialForcesTieFighter.exhausted).toBe(false);
        });

        it('Special Forces TIE Fighter\'s ability should not ready the unit for controlling fewer units in the space arena', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['special-forces-tie-fighter'],
                    groundArena: ['war-juggernaut']
                },
                player2: {
                    groundArena: ['first-legion-snowtrooper', 'death-star-stormtrooper'],
                    spaceArena: ['imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.specialForcesTieFighter);

            expect(context.specialForcesTieFighter.exhausted).toBe(true);
        });
    });
});