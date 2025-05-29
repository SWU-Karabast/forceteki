describe('Losing and gaining keywords', function() {
    integration(function(contextRef) {
        describe('If a unit has a keyword given by a source, then loses that keyword due to an ability,', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['consular-security-force', 'crafty-smuggler']
                    },
                    player2: {
                        groundArena: ['vigilant-honor-guards'],
                        hand: ['protector', 'repair', 'general-rieekan#defensive-strategist']
                    }
                });
            });

            it('it should not regain the keyword from that source after the source\'s condition toggles off then on', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.craftySmuggler);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards, context.p2Base]);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(2);

                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(0);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('it should not be able to gain the keyword again from an upgrade', function() {
                const { context } = contextRef;

                const reset = () => {
                    context.setDamage(context.consularSecurityForce, 0);
                    context.readyCard(context.consularSecurityForce);
                    context.setDamage(context.vigilantHonorGuards, 0);
                };

                // no effects beyond what's printed on the card: honor guards has sentinel
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards]);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(4);

                reset();
                context.player2.passAction();

                // first specforce soldier removes sentinel
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards]);
                context.player1.clickCard(context.p2Base);

                reset();

                // play Protector, nothing changes
                context.player2.clickCard(context.protector);
                context.player2.clickCard(context.vigilantHonorGuards);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards]);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(5);
            });

            it('it should not be able to gain the keyword again from a lasting effect', function() {
                const { context } = contextRef;

                const reset = () => {
                    context.setDamage(context.consularSecurityForce, 0);
                    context.readyCard(context.consularSecurityForce);
                    context.setDamage(context.vigilantHonorGuards, 0);
                };

                // no effects beyond what's printed on the card: honor guards has sentinel
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards]);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(4);

                reset();
                context.player2.passAction();

                // first specforce soldier removes sentinel
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards]);
                context.player1.clickCard(context.p2Base);

                reset();

                // play Rieekan and target honor guards, nothing changes
                context.player2.clickCard(context.generalRieekan);
                context.player2.clickCard(context.vigilantHonorGuards);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards, context.generalRieekan]);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(4);
            });
        });
    });
});
