describe('Canyon Frontrunner', function() {
    integration(function(contextRef) {
        describe('Canyon Frontrunner\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['canyon-frontrunner', 'wampa']
                    },
                    player2: {
                        hand: ['resupply'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should give -2/-0 to a unit if no other units have attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.canyonFrontrunner);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.canyonFrontrunner, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(5);

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should give -2/-0 to a unit if no other units have attacked (even if another unit have attacked another phase)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.canyonFrontrunner);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.canyonFrontrunner, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(5);

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should give -2/-0 to a unit if no other units have attacked (other non-attack action are done before)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.resupply);

                context.player1.clickCard(context.canyonFrontrunner);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.canyonFrontrunner, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(5);

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should not give -2/-0 to a unit if another friendly unit have already attacked this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.canyonFrontrunner);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not give -2/-0 to a unit if enemy unit have already attacked this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.awing);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.canyonFrontrunner);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not give -2/-0 to a unit if another friendly unit have already attacked on the same action', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['canyon-frontrunner', 'wampa'],
                    leader: 'colonel-yularen#this-is-why-we-plan',
                    resources: 0,
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.colonelYularen);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.canyonFrontrunner);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('should give -2/-0 to a unit (event if unit have attacked on the previous regroup phase)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['syndicate-lackeys', 'sneak-attack'],
                    groundArena: ['canyon-frontrunner', 'wampa'],
                },
                player2: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['battlefield-marine', 'gungi#finding-himself']
                }
            });

            const { context } = contextRef;

            // Play Sneak Attack + Syndicate Lackeys
            context.player1.clickCard(context.sneakAttack);
            context.player1.clickCard(context.syndicateLackeys);
            // Pass Ambush
            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.unrefusableOffer);
            context.player2.clickCard(context.syndicateLackeys);

            context.moveToRegroupPhase();

            // Trigger Unrefusable Offer
            context.player2.clickPrompt('Trigger');
            // Trigger Ambush
            context.player2.clickPrompt('Trigger');
            context.player2.clickCard(context.wampa);

            expect(context.syndicateLackeys).toBeInZone('discard', context.player1);
            expect(context.wampa).toBeInZone('discard', context.player1);

            // Pass resourcing
            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');

            context.player1.clickCard(context.canyonFrontrunner);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi, context.canyonFrontrunner]);
            context.player1.clickCard(context.gungi);

            expect(context.player2).toBeActivePlayer();
            expect(context.gungi.getPower()).toBe(0);
            expect(context.gungi.getHp()).toBe(5);
        });
    });
});
