describe('Mylaya Rider', function() {
    integration(function(contextRef) {
        describe('Mylaya Rider\'s when played ability', function() {
            it('should create a Beast token and heal 2 damage from its controller\'s base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'kestro-city', damage: 5 },
                        hand: ['mylaya-rider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mylayaRider);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(beast.getPower()).toBe(3);
                expect(beast.getHp()).toBe(3);
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still create a Beast token when the base has no damage to heal', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mylaya-rider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mylayaRider);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only heal up to the amount of damage on the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'kestro-city', damage: 1 },
                        hand: ['mylaya-rider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mylayaRider);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
