describe('Improvised Detonation', function() {
    integration(function(contextRef) {
        describe('Improvised Detonation\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['improvised-detonation'],
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'fleet-lieutenant'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('can attack with a unit and give it +2/+0 for the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.improvisedDetonation);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.fleetLieutenant, context.p2Base]);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6); // Wampa's base power (4) + 2 from Improvised Detonation
            });

            it('can attack a base with the power boost', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.improvisedDetonation);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.fleetLieutenant, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6); // Wampa's base power (4) + 2 from Improvised Detonation
            });

            it('provides a temporary power boost that does not persist after the attack', function () {
                const { context } = contextRef;

                // First attack with Improvised Detonation
                context.player1.clickCard(context.improvisedDetonation);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6); // Wampa's base power (4) + 2 from Improvised Detonation

                // Verify the power boost is temporary by checking wampa's power
                expect(context.wampa.getPower()).toBe(4); // Back to base power after attack
            });
        });
    });
});