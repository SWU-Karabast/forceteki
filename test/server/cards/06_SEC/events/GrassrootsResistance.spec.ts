describe('Grassroots Resistance', function () {
    integration(function (contextRef) {
        describe('Grassroots Resistance\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['grassroots-resistance'],
                        groundArena: ['pyke-sentinel', 'atst'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should deal 3 damage to an enemy unit and heal 3 damage from your base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grassrootsResistance);

                // Can target any unit in play (friendly, enemy, or leader)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.atst,
                    context.wampa,
                    context.cartelSpacer,
                    context.sabineWren
                ]);

                // Target enemy Wampa
                context.player1.clickCard(context.wampa);

                // 3 damage is dealt
                expect(context.wampa.damage).toBe(3);
                // Base heals 3
                expect(context.p1Base.damage).toBe(2);
            });

            it('should deal 3 damage to an ally unit and heal 3 damage from your base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grassrootsResistance);

                // Target allied AT-ST
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(3);
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
