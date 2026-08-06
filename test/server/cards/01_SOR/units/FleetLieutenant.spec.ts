describe('Fleet Lieutenant', function() {
    integration(function(contextRef) {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'mon-mothma#voice-of-the-rebellion'],
                        base: 'energy-conversion-lab'
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
                expect(context.fleetLieutenant).toBeInZone('groundArena');
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
                context.readyCard(context.monMothma);
                context.player1.clickCard(context.monMothma);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.monMothma.damage).toBe(2);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('groundArena');

                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the user to pass on the attack at the target select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('groundArena');

                context.player1.clickCard(context.monMothma);

                context.player1.clickPrompt('Pass attack');
                expect(context.player2).toBeActivePlayer();
                expect(context.monMothma.exhausted).toBe(false);
            });

            it('cannot buff itself when played with Ambush', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.energyConversionLab);
                context.player1.clickCard(context.fleetLieutenant);

                expect(context.player1).toHaveEnabledPromptButtons(['Attack with a unit', 'Ambush']);
                context.player1.clickPrompt('Attack with a unit');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.monMothma]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper]);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.sundariPeacekeeper.damage).toBe(3);
            });
        });
    });
});
