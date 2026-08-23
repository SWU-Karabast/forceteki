describe('Bacta Tank', function() {
    integration(function(contextRef) {
        it('Bacta Tank\'s when played ability should heal up to 3 damage from a non-Vehicle unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bacta-tank'],
                    groundArena: [{ card: 'wampa', damage: 4 }, { card: 'atst', damage: 4 }],
                },
                player2: {

                    spaceArena: [{ card: 'mynock', damage: 2 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bactaTank);
            context.player1.clickCard(context.p1Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.mynock]);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.wampa, 3],
            ]));

            expect(context.wampa.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Bacta Tank\'s action ability should defeat this upgrade and put a non-Vehicle unit from your discard pile on top of your deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'great-grass-plains', upgrades: ['bacta-tank'] },
                    discard: ['wampa', 'tieln-fighter', 'mynock'],
                    deck: ['battlefield-marine']
                },
                player2: {
                    discard: ['porg'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bactaTank);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.mynock]);
            context.player1.clickCard(context.wampa);

            expect(context.bactaTank).toBeInZone('discard', context.player1);
            expect(context.wampa).toBeInZone('deck', context.player1);
            expect(context.player1.deck[0]).toBe(context.wampa);
            expect(context.player1.deck[1]).toBe(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
