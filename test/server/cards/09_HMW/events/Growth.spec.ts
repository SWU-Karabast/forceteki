describe('Growth', function() {
    integration(function(contextRef) {
        it('Growth\'s ability should draw a card, create a Beast token and heal 3 damage from our base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['growth'],
                    deck: ['battlefield-marine', 'porg'],
                    base: { card: 'jabbas-palace', damage: 10 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.growth);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(7);
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.porg).toBeInZone('deck', context.player1);
            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
        });

        it('Growth\'s ability should draw a card, create a Beast token and heal 3 damage from our base (empty deck)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['growth'],
                    deck: [],
                    base: { card: 'jabbas-palace', damage: 10 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.growth);

            expect(context.player2).toBeActivePlayer();

            // 3 damage healed but 3 damaged dealt while trying to draw
            expect(context.p1Base.damage).toBe(10);

            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
        });
    });
});