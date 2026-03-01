describe('Boonta Eve Flagbearer', function() {
    integration(function(contextRef) {
        describe('Boonta Eve Flagbearer\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['boonta-eve-flagbearer', 'wampa'],
                        base: { card: 'jabbas-palace', damage: 5 }
                    },
                    player2: {
                        hand: ['resupply'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should heal 2 damage from our base if no other units have attacked this phase (Boonta Eve Flagbearer attacks)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.boontaEveFlagbearer);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should heal 2 damage from our base if no other units have attacked this phase (friendly unit attacks)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should heal 2 damage from our base if no other units have attacked this phase (another non-attack action is done before attacking)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.resupply);

                context.player1.clickCard(context.boontaEveFlagbearer);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not heal 2 damage from our base if enemy units have attacked this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.awing);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.boontaEveFlagbearer);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(7);
            });
        });
    });
});
