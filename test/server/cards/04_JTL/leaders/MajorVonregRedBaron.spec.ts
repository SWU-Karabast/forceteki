describe('Major Vonreg, Red Baron', function() {
    integration(function(contextRef) {
        describe('Major Vonreg, Red Baron\'s undeployed ability', function() {
            it('should play a Vehicle unit from your hand (paying its cost). If you do, give another unit +1/+0 for this phase.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'major-vonreg#red-baron',
                        hand: ['vonregs-tie-interceptor#ace-of-the-first-order', 'imperial-interceptor'],
                        spaceArena: ['tieln-fighter'],
                        resources: 3
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.majorVonregRedBaron);
                context.player1.clickCard(context.vonregsTieInterceptorAceOfTheFirstOrder);
                expect(context.vonregsTieInterceptorAceOfTheFirstOrder).toBeInZone('spaceArena');
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.allianceXwing, context.wampa]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.majorVonregRedBaron.exhausted).toBe(true);

                context.player2.passAction();

                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3); // 2 from tie +1 from vonreg

                context.moveToNextActionPhase();

                // the +1/+0 should have worn off
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5); // +2 from tie
            });
        });


        describe('Major Vonreg, Red Baron\'s deployed ability', function() {
            it('should not have an on attack ability when deployed as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'major-vonreg#red-baron',
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.majorVonregRedBaron);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Major Vonreg',
                    'Play a Vehicle unit from your hand (paying its cost). If you do, give another unit +1/+0 for this phase.'
                ]);
                context.player1.clickPrompt('Deploy Major Vonreg');
                expect(context.majorVonregRedBaron.deployed).toBe(true);

                // Check that the deployed unit stats are 2/5
                expect(context.majorVonregRedBaron.getPower()).toBe(2);
                expect(context.majorVonregRedBaron.getHp()).toBe(5);

                context.player2.passAction();

                context.player1.clickCard(context.majorVonregRedBaron);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should give an on attack ability to attached unit when deployed as a pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'major-vonreg#red-baron',
                        spaceArena: ['vonregs-tie-interceptor#ace-of-the-first-order', 'imperial-interceptor'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.majorVonregRedBaron);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Major Vonreg', 'Deploy Major Vonreg as a Pilot',
                    'Play a Vehicle unit from your hand (paying its cost). If you do, give another unit +1/+0 for this phase.'
                ]);
                context.player1.clickPrompt('Deploy Major Vonreg as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.vonregsTieInterceptorAceOfTheFirstOrder, context.imperialInterceptor]);
                context.player1.clickCard(context.vonregsTieInterceptorAceOfTheFirstOrder);

                context.player2.passAction();

                // Attack base (and give +1/+0 to a unit while doing so)
                context.player1.clickCard(context.vonregsTieInterceptorAceOfTheFirstOrder);
                context.player1.clickCard(context.p2Base);

                // Now we have to select who gets the +1 (make sure it doesn't include the parent card -- has to be other)
                expect(context.player1).toBeAbleToSelectExactly([context.imperialInterceptor, context.allianceXwing]);
                context.player1.clickCard(context.imperialInterceptor);

                expect(context.p2Base.damage).toBe(7); // 3 from tie, 3 from vonreg, and +1 Raid from tie's ability (so 7 power on the card now)
                expect(context.vonregsTieInterceptorAceOfTheFirstOrder.getHp()).toBe(7); // 4 from base +3 vonreg pilot
            });
        });
    });
});
