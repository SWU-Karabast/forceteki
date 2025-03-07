describe('Spark of Hope', function () {
    integration(function (contextRef) {
        describe('Spark of Hope\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['spark-of-hope'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['imperial-interceptor'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['mercenary-gunship']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('can resource a unit defeated this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.mercenaryGunship);

                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.sparkOfHope);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.imperialInterceptor]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.player2).toBeActivePlayer();
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.imperialInterceptor).toBeInZone('discard');
            });

            it('can resource a unit defeated this phase (do not play unit defeated previous phases)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.mercenaryGunship);

                context.moveToNextActionPhase();
                context.player1.passAction();

                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.sparkOfHope);
                // pyke sentinel is automatically choose

                expect(context.player2).toBeActivePlayer();
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.imperialInterceptor).toBeInZone('discard');
            });
        });

        it('Spark of Hope\'s ability should only affect units that were defeated as their most recent in-play copy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion', 'spark-of-hope'],
                    groundArena: ['atst', 'wampa']
                },
                player2: {
                    hand: ['superlaser-blast', 'waylay', 'force-throw', 'vanquish'],
                    resources: 30,
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // both units are defeated and returned to hand
            context.player2.clickCard(context.superlaserBlast);
            context.player1.clickCard(context.theEmperorsLegion);
            expect(context.atst).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');

            // play AT-ST, then it gets waylaid and discarded (so this copy was never defeated)
            context.player2.passAction();
            context.player1.clickCard(context.atst);
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.atst);

            context.player1.passAction();
            context.player2.clickCard(context.forceThrow);
            context.player2.clickPrompt('Opponent');
            context.player1.clickCard(context.atst);

            // play Wampa then defeat it, so it now has two separately defeated copies this phase
            context.player1.clickCard(context.wampa);
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.wampa);

            // play Spark of Hope, only the Wampa should be eligible to be resourced
            // (and not cause an error due to two defeated copies)
            context.player1.clickCard(context.sparkOfHope);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.atst).toBeInZone('discard');
            expect(context.wampa).toBeInZone('resource');
        });
    });
});
