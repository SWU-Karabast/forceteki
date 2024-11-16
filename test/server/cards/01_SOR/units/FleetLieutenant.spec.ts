describe('Fleet Lieutenant', function() {
    integration(function(contextRef) {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'mon-mothma#voice-of-the-rebellion']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow triggering an attack by a unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('ground arena');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.monMothma]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sundariPeacekeeper]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('if used with a rebel unit should give it +2 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);

                context.player1.clickCard(context.monMothma);
                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.monMothma.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                context.player2.passAction();
                context.monMothma.exhausted = false;
                context.player1.clickCard(context.monMothma);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.monMothma.damage).toBe(2);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('ground arena');

                context.player1.clickPrompt('Pass ability');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the user to pass on the attack at the target select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('ground arena');

                context.player1.clickCard(context.monMothma);

                context.player1.clickPrompt('Pass attack');
                expect(context.player2).toBeActivePlayer();
                expect(context.monMothma.exhausted).toBe(false);
            });
        });
    });
});
