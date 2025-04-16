describe('Hello There', function() {
    integration(function(contextRef) {
        describe('Hello There\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hello-there', 'green-squadron-awing', 'pyke-sentinel'],
                        groundArena: [
                            {
                                card: 'discerning-veteran',
                                capturedUnits: ['village-protectors']
                            }
                        ]
                    },
                    player2: {
                        leader: 'captain-rex#fighting-for-his-brothers',
                        hand: ['atst', 'consular-security-force', 'takedown']
                    }
                });
            });

            it('should apply -4/-4 to a unit which entered play this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pykeSentinel);
                context.player2.clickCard(context.consularSecurityForce);

                context.moveToNextActionPhase();

                // play a-wing & opponent plays atst
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.atst);

                // play hello there, should be able to select a-wing & at-st
                context.player1.clickCard(context.helloThere);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.atst]);

                // at-st should be 2/3
                context.player1.clickCard(context.atst);
                expect(context.atst.getPower()).toBe(2);
                expect(context.atst.getHp()).toBe(3);

                // on next phase -4/-4 should be gone
                context.moveToNextActionPhase();
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });

            it('should work on leader units deployed this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 deploys Captain Rex
                context.player2.clickCard(context.captainRex);
                context.player2.clickPrompt('Deploy Captain Rex');

                const cloneTrooper = context.player2.findCardByName('clone-trooper', 'groundArena');

                // Player 1 plays Hello There, targeting Captain Rex
                context.player1.clickCard(context.helloThere);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.captainRex,
                    cloneTrooper,
                ]);
                context.player1.clickCard(context.captainRex);

                // Captain Rex should be 0/2
                expect(context.captainRex.getPower()).toBe(0);
                expect(context.captainRex.getHp()).toBe(2);

                // On next phase -4/-4 should be gone
                context.moveToNextActionPhase();
                expect(context.captainRex.getPower()).toBe(2);
                expect(context.captainRex.getHp()).toBe(6);
            });

            it('should work on token units that entered play this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 deploys Captain Rex to create a Clone Trooper token
                context.player2.clickCard(context.captainRex);
                context.player2.clickPrompt('Deploy Captain Rex');

                const cloneTrooper = context.player2.findCardByName('clone-trooper', 'groundArena');

                // Player 1 plays Hello There, targeting Clone Trooper
                context.player1.clickCard(context.helloThere);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.captainRex,
                    cloneTrooper,
                ]);
                context.player1.clickCard(cloneTrooper);

                // Clone Trooper should be defeated by the -4/-4 stat modifier
                expect(cloneTrooper).toBeInZone('outsideTheGame');
            });

            it('should be able to target units that were rescued from capture this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 plays Takedown to defeat Discerning Veteran
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.discerningVeteran);

                // Village Protectors are rescued from capture
                expect(context.villageProtectors).toBeInZone('groundArena');

                // Player 1 plays Hello There, targeting Village Protectors
                context.player1.clickCard(context.helloThere);
                expect(context.player1).toBeAbleToSelectExactly([context.villageProtectors]);
                context.player1.clickCard(context.villageProtectors);

                // Village Protectors should be defeated by the -4/-4 stat modifier
                expect(context.villageProtectors).toBeInZone('discard');
            });

            it('should not be able to target units, leaders, or tokens that entered play in the previous phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 deploys Captain Rex
                context.player2.clickCard(context.captainRex);
                context.player2.clickPrompt('Deploy Captain Rex');

                context.player1.passAction();

                // Player 2 plays Consular Security Force
                context.player2.clickCard(context.consularSecurityForce);

                // Move to the next action phase
                context.moveToNextActionPhase();

                // Player 1 plays Hello There, but there are no valid targets
                context.player1.clickCard(context.helloThere);

                // Event resolves immediately due to no valid targets
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
