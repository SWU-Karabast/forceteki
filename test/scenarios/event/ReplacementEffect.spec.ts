describe('Replacement effect', function() {
    integration(function(contextRef) {
        describe('when a unit with one or more shields takes damage from a cost action', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'doctor-pershing#experimenting-with-life', upgrades: ['shield', 'shield'] }],
                    },
                    player2: {
                        groundArena: ['vanguard-infantry'],
                    }
                });
            });

            it('one shield is removed', function () {
                const { context } = contextRef;

                expect(context.doctorPershing).toHaveExactUpgradeNames(['shield', 'shield']);

                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');

                expect(context.doctorPershing.damage).toBe(0);
                expect(context.doctorPershing).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.hand.length).toBe(1);
            });
        });
    });
});
