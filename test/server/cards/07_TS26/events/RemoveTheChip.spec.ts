describe('Remove the Chip', function() {
    integration(function(contextRef) {
        describe('Remove the Chip\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['remove-the-chip'],
                        groundArena: ['wrecker#boom', { card: 'hevy#staunch-martyr', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', exhausted: true }, { card: 'daro-commando', exhausted: true }]
                    }
                });
            });

            it('should deal 2 damage to a unit and not ready it if it is not a Clone', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.removeTheChip);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(2);
                expect(context.atst.exhausted).toBeTrue();
            });

            it('should deal 2 damage to a unit and ready it if it is a Clone (already ready)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.removeTheChip);
                context.player1.clickCard(context.wrecker);

                expect(context.player2).toBeActivePlayer();
                expect(context.wrecker.damage).toBe(2);
                expect(context.wrecker.exhausted).toBeFalse();
            });

            it('should deal 2 damage to a unit and ready it if it is a Clone', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.removeTheChip);
                context.player1.clickCard(context.hevy);

                expect(context.player2).toBeActivePlayer();
                expect(context.hevy.damage).toBe(2);
                expect(context.hevy.exhausted).toBeFalse();
            });

            it('should deal 2 damage to a unit and ready it if it is a Clone (enemy clone unit)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.removeTheChip);
                context.player1.clickCard(context.daroCommando);

                expect(context.player2).toBeActivePlayer();
                expect(context.daroCommando.damage).toBe(2);
                expect(context.daroCommando.exhausted).toBeFalse();
            });
        });
    });
});
