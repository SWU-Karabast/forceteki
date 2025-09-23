describe('Hondo Ohnaka, Superfluous Swindler', function() {
    integration(function(contextRef) {
        it('Hondo Ohnaka\'s ability takes control of an non-pilot upgrade and attach it to a different unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['independent-smuggler'],
                    groundArena: [
                        { card: 'atst', upgrades: ['smuggling-compartment'] },
                        { card: 'wampa', upgrades: ['shield'] }
                    ],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    groundArena: ['hondo-ohnaka#superfluous-swindler', 'frontier-atrt'],
                    leader: 'finn#this-is-a-rescue',
                    resources: 4
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.independentSmuggler);
            context.player1.clickPrompt('Play Independent Smuggler with Piloting');
            context.player1.clickCard(context.atst);

            context.player2.clickCard(context.hondoOhnaka);
            context.player2.clickCard(context.p1Base);
            expect(context.player2).toBeAbleToSelectExactly([context.smugglingCompartment, context.shield]);
            context.player2.clickCard(context.smugglingCompartment);
            expect(context.player2).toBeAbleToSelectExactly([context.phoenixSquadronAwing, context.frontierAtrt]);
            context.player2.clickCard(context.frontierAtrt);

            expect(context.frontierAtrt).toHaveExactUpgradeNames(['smuggling-compartment']);

            context.player1.passAction();

            // assert we have control of upgrade with finn ability which target only upgrade we control
            context.player2.clickCard(context.finn);
            expect(context.player2).toBeAbleToSelectExactly([context.smugglingCompartment]);
            context.player2.clickCard(context.smugglingCompartment);

            expect(context.player1).toBeActivePlayer();
            expect(context.frontierAtrt).toHaveExactUpgradeNames(['shield']);
        });

        it('Hondo Ohnaka\'s ability can be used to move upgrades across zones', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    hand: ['traitorous'],
                },
                player2: {
                    groundArena: ['superlaser-technician', 'wampa', 'hondo-ohnaka#superfluous-swindler'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                }
            });
            const { context } = contextRef;

            // Player 1 plays Traitorous to take control of the Superlaser Technician
            context.player1.clickCard(context.traitorous);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.hondoOhnaka]);
            context.player1.clickCard(context.superlaserTechnician);
            expect(context.traitorous.controller).toBe(context.player1Object);

            // Player 2 attacks with Hondo Ohnaka and moves Traitorous to the Cartel Spacer
            // taking control of it and regaining control of the Superlaser Technician
            context.player2.clickCard(context.hondoOhnaka);
            context.player2.clickCard(context.p1Base);
            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.cartelSpacer);
            context.player2.clickPrompt('Take control of attached unit');

            expect(context.traitorous.controller).toBe(context.player2Object);
            expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
            expect(context.cartelSpacer).toHaveExactUpgradeNames(['traitorous']);
            expect(context.cartelSpacer).toBeInZone('spaceArena', context.player2);
        });

        it('can be used to take control of an upgrade with a friendly unit attach condition', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hondo-ohnaka#superfluous-swindler']
                },
                player2: {
                    groundArena: [
                        'secretive-sage',
                        {
                            card: 'crafty-smuggler',
                            upgrades: [
                                'craving-power',
                                'entrenched'
                            ]
                        }
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hondoOhnaka);
            context.player1.clickCard(context.p2Base);

            // Both upgrades are selectable
            expect(context.player1).toBeAbleToSelectExactly([context.cravingPower, context.entrenched]);
            context.player1.clickCard(context.cravingPower);

            // Can only attach Craving Power to a friendly unit (Hondo)
            expect(context.player1).toBeAbleToSelectExactly([context.hondoOhnaka]);
            context.player1.clickCard(context.hondoOhnaka);

            expect(context.hondoOhnaka).toHaveExactUpgradeNames(['craving-power']);
            expect(context.craftySmuggler).toHaveExactUpgradeNames(['entrenched']);
        });

        it('cannot be used to attach an upgrade to a different unit if no other units are eligible', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hondo-ohnaka#superfluous-swindler']
                },
                player2: {
                    groundArena: [
                        {
                            card: 'secretive-sage',
                            upgrades: ['constructed-lightsaber']
                        }
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hondoOhnaka);
            context.player1.clickCard(context.secretiveSage);

            // The ability is automatically skipped because there are no other Force units to attach Constructed Lightsaber to
            expect(context.player2).toBeActivePlayer();
        });
    });
});