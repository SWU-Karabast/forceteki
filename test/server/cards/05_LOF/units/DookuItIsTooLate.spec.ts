describe('Dooku, It Is Too Late', function () {
    integration(function (contextRef) {
        describe('Dooku\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dooku#it-is-too-late', 'atst'],
                        groundArena: [
                            'aurra-sing#patient-and-deadly',
                            'wampa',
                            {
                                card: 'anakin-skywalker#force-prodigy',
                                upgrades: ['protector']
                            }],
                        leader: { card: 'third-sister#seething-with-ambition', deployed: true }
                    },
                    player2: {
                        hand: ['imprisoned'],
                        groundArena: ['village-tender', 'rebel-pathfinder', 'guavian-antagonizer']
                    }
                });
            });

            it('should protect units with Hidden from being attacked', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.passAction();

                // check current hidden
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.aurraSing, context.wampa, context.thirdSister, context.p1Base, context.anakinSkywalker]);
                player2.clickCard(context.p1Base);

                // play dooku
                player1.clickCard(context.dooku);

                // unit with hidden ability should not be attackable (unless they have sentinel)
                player2.clickCard(context.guavianAntagonizer);
                expect(player2).toBeAbleToSelectExactly([context.wampa, context.p1Base, context.anakinSkywalker]);
                player2.clickCard(context.p1Base);

                // opponent hidden unit should not be protected
                player1.clickCard(context.wampa);
                expect(player1).toBeAbleToSelectExactly([context.p2Base, context.villageTender, context.rebelPathfinder, context.guavianAntagonizer]);
                player1.clickCard(context.p2Base);
            });

            it('should not protect units that has Hidden in a previous phase from being attacked', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                // trigger third sister ability
                player1.clickCard(context.thirdSister);
                player1.clickCard(context.p2Base);

                player2.passAction();

                // play atst with hidden (should last until its death)
                player1.clickCard(context.atst);

                context.moveToNextActionPhase();

                // play dooku and protect hidden units
                player1.clickCard(context.dooku);

                // atst is selectable because it no longer has hidden
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.wampa, context.p1Base, context.anakinSkywalker, context.atst]);
                player2.clickCard(context.p1Base);
            });

            it('should not protect units with Hidden that have lost their abilities', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.passAction();

                // disable ability on aurra sing
                player2.clickCard(context.imprisoned);
                player2.clickCard(context.aurraSing);

                // play dooku and protect hidden units
                player1.clickCard(context.dooku);

                // should be able to attack aurra sing because she had lost her abilities
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.wampa, context.p1Base, context.anakinSkywalker, context.aurraSing]);
                player2.clickCard(context.p1Base);
            });
        });

        describe('Dooku\'s ability when Hidden is removed after it resolves', function () {
            // Ruling 2025-09-29: Dooku's protection is a snapshot taken when his ability resolves —
            // every unit with Hidden at that moment stays protected for the phase, even if its Hidden
            // is removed afterward (the lasting effect does not dynamically update).
            it('keeps protecting a unit even after its Hidden keyword is removed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dooku#it-is-too-late'],
                        // Aurra Sing has printed Hidden but was not played this phase, so she is attackable
                        groundArena: ['aurra-sing#patient-and-deadly'],
                        resources: 10,
                    },
                    player2: {
                        hand: ['tusken-tracker'],
                        groundArena: ['rebel-pathfinder'],
                        resources: 10,
                    }
                });

                const { context } = contextRef;

                // Aurra Sing has Hidden when Dooku's When Played resolves
                context.player1.clickCard(context.dooku);

                // Tusken Tracker's When Played makes each enemy unit lose Hidden for this phase
                context.player2.clickCard(context.tuskenTracker);

                context.player1.passAction();

                // Aurra Sing no longer has Hidden but Dooku's snapshot protection still applies:
                // she can't be attacked this phase (Dooku has Hidden itself, only the base is attackable)
                context.player2.clickCard(context.rebelPathfinder);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
