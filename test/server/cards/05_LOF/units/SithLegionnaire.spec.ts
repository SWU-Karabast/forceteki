describe('Sith Legionnaire', function() {
    integration(function(contextRef) {
        describe('Sith Legionnaire\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sith-trooper'],
                        groundArena: ['sith-legionnaire', 'wampa']
                    },
                    player2: {
                        groundArena: ['darth-malak#covetous-apprentice']
                    },
                });
            });

            it('should have base stats when no other Villainy unit is controlled', function () {
                const { context } = contextRef;
                // Base power should be 2
                expect(context.sithLegionnaire.getPower()).toBe(2);
            });

            it('should get +2/+0 when another Villainy unit is controlled', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sithTrooper);

                // Power should be increased to 4 (base 2 + 2 from ability)
                expect(context.sithLegionnaire.getPower()).toBe(4);

                // Health should remain at base value (2)
                expect(context.sithLegionnaire.getHp()).toBe(2);
            });
        });
    });
});