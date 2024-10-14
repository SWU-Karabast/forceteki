describe('Cargo Juggernaut', function () {
    integration(function () {
        describe('Cargo Juggernaut\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cargo-juggernaut'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['rugged-survivors']
                    }
                });
            });

            it('should heal base when there is a Vigilance ally', function () {
                const { context } = contextRef;

                context.p1Base.damage = 10;
                context.player1.clickCard(context.cargoJuggernaut);
                // cargo juggernaut need to order its triggers between shield & when played
                context.player1.clickPrompt('If you control another Vigilance unit, heal 4 damage from your base');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(6);
            });
        });

        describe('Cargo Juggernaut\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cargo-juggernaut'],
                    },
                    player2: {
                        groundArena: ['rugged-survivors']
                    }
                });
            });

            it('should not heal base when there is not any Vigilance ally', function () {
                const { context } = contextRef;

                context.p1Base.damage = 10;
                context.player1.clickCard(context.cargoJuggernaut);
                context.player1.clickPrompt('If you control another Vigilance unit, heal 4 damage from your base');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });
        });
    });
});
