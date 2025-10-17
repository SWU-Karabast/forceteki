describe('Heroic ARC-170', function() {
    integration(function(contextRef) {
        it('Heroic ARC-170\'s ability does nothing if we do not control damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-arc170'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['strikeship'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicArc170);
            expect(context.player2).toBeActivePlayer();
        });

        it('Heroic ARC-170\'s ability should deal 2 damage to an enemy unit if we control a damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-arc170'],
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['strikeship'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicArc170);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strikeship, context.lukeSkywalkerFaithfulFriend]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
        });
    });
});
