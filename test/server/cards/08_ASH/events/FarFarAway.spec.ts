describe('Far Far Away', function() {
    integration(function(contextRef) {
        it('should return a friendly non-leader unit to hand, then return an enemy non-leader unit to hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['far-far-away'],
                    groundArena: ['battlefield-marine', 'wampa'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.farFarAway);
            expect(context.player1).toHavePrompt('Choose a friendly non-leader unit to return to hand');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]); // Leaders should not be selectable

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHavePrompt('Choose an enemy non-leader unit to return to hand');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.consularSecurityForce]); // Leaders should not be selectable

            context.player1.clickCard(context.atst);

            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player2);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs(2)).toEqual([
                'player1 plays Far Far Away to return Battlefield Marine to their hand',
                'player1 uses Far Far Away to return AT-ST to player2\'s hand',
            ]);
        });

        it('should not bounce an enemy unit if there are no friendly non-leader units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['far-far-away'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            // No friendly non-leader units to target, card plays with no effect
            context.player1.clickCard(context.farFarAway);
            context.player1.clickPrompt('Play anyway');

            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs()).toEqual([
                'player1 plays Far Far Away'
            ]);
        });

        it('should return a friendly unit to hand even if there are no valid enemy non-leader units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['far-far-away'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.farFarAway);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.lukeSkywalker).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs()).toEqual([
                'player1 plays Far Far Away to return Battlefield Marine to their hand',
            ]);
        });
    });
});
