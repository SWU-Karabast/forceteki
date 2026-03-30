describe('Twilight, Escaping Malevolence', function() {
    integration(function(contextRef) {
        it('should heal 3 damage from your base when you have 5 or more cards in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['twilight#escaping-malevolence'],
                    discard: ['wampa', 'atst', 'battlefield-marine', 'cartel-spacer', 'snowtrooper-lieutenant'],
                    base: { card: 'jabbas-palace', damage: 10 }
                },
                player2: {
                    discard: ['wampa', 'atst', 'battlefield-marine', 'cartel-spacer', 'snowtrooper-lieutenant'],
                    base: { card: 'jabbas-palace', damage: 10 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.twilight);

            expect(context.p1Base.damage).toBe(7);
            expect(context.p2Base.damage).toBe(10);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not heal if you have fewer than 5 cards in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['twilight#escaping-malevolence'],
                    discard: ['wampa', 'atst', 'battlefield-marine', 'cartel-spacer'],
                    base: { card: 'jabbas-palace', damage: 10 }
                },
                player2: {
                    discard: ['wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                    base: { card: 'jabbas-palace', damage: 10 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.twilight);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(10);
            expect(context.p2Base.damage).toBe(10);
        });
    });
});
