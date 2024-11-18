describe('Snowtrooper Lieutenant', function() {
    integration(function(contextRef) {
        describe('Snowtrooper Lieutenant\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['snowtrooper-lieutenant'],
                        groundArena: ['wampa', 'admiral-piett#captain-of-the-executor']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allowing triggering an attack by a unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snowtrooperLieutenant);
                expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.admiralPiett]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sundariPeacekeeper]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('if used with an imperial unit should give it +2 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snowtrooperLieutenant);

                context.player1.clickCard(context.admiralPiett);
                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.admiralPiett.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                context.player2.passAction();
                context.admiralPiett.exhausted = false;
                context.player1.clickCard(context.admiralPiett);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.admiralPiett.damage).toBe(2);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });
        });
    });
});
