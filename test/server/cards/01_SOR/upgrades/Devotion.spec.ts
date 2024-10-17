describe('Devotion', function() {
    integration(function(contextRef) {
        describe('Devotion\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['devotion'] }],
                    },
                    player2: {
                    }
                });
            });

            it('should cause the attached card to heal 2 damage from base on attack', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);

                // attack resolves automatically since there's only one target (p2Base)
                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(5);
                expect(context.wampa.exhausted).toBe(true);
            });
        });
    });
});
