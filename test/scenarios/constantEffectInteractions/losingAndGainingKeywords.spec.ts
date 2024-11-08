describe('Losing and gaining keywords', function() {
    integration(function(contextRef) {
        describe('If a unit has a keyword given by a source, then loses that keyword due to an ability,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier', 'specforce-soldier'],
                        groundArena: ['consular-security-force', 'crafty-smuggler']
                    },
                    player2: {
                        groundArena: ['vigilant-honor-guards'],
                        hand: ['protector', 'protector', 'repair']
                    }
                });

                const { context } = contextRef;
                const specforceSoldiers = context.player1.findCardsByName('specforce-soldier');
                context.specforce1 = specforceSoldiers[0];
                context.specforce2 = specforceSoldiers[1];
                const protectors = context.player2.findCardsByName('protector');
                context.protector1 = protectors[0];
                context.protector2 = protectors[1];
            });

            it('it should not regain the keyword from that source after the source\'s condition toggles off then on', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.specforce1);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.craftySmuggler);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(2);

                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(0);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards, context.p2Base]);
            });

            it('it should be able to gain the keyword again from a different source, lose it again(from a different ability instance), then gain it again from yet another source', function() {
                const { context } = contextRef;

                const reset = () => {
                    context.consularSecurityForce.damage = 0;
                    context.consularSecurityForce.exhausted = false;
                    context.vigilantHonorGuards.damage = 0;
                };

                // no effects beyond what's printed on the card: honor guards has sentinel
                context.player1.clickCard(context.consularSecurityForce);
                // attack target chosen automatically due to sentinel
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(4);

                reset();
                context.player2.passAction();

                // first specforce soldier removes sentinel
                context.player1.clickCard(context.specforce1);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards]);
                context.player1.clickCard(context.p2Base);

                reset();

                // first protector adds sentinel
                context.player2.clickCard(context.protector1);
                context.player2.clickCard(context.vigilantHonorGuards);

                context.player1.clickCard(context.consularSecurityForce);
                // attack target chosen automatically due to sentinel
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(5);

                reset();
                context.player2.passAction();

                // second specforce soldier removes sentinel again
                context.player1.clickCard(context.specforce2);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.vigilantHonorGuards]);
                context.player1.clickCard(context.p2Base);

                reset();

                // second protector adds sentinel again
                context.player2.clickCard(context.protector2);
                context.player2.clickCard(context.vigilantHonorGuards);

                context.player1.clickCard(context.consularSecurityForce);
                // attack target chosen automatically due to sentinel
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(6);
            });
            // TODO: once overall ability blanking is implemented(Imprisoned):
            // Find out the rules and make tests for interaction between that and SpecForce(e.g. Imprisoned unit with sentinel is targeted by SpecForce, then Imprisoned is removed. What happens?)
        });
    });
});
