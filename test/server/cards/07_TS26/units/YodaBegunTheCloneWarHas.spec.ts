describe('Yoda, Begun, The Clone War Has', function () {
    integration(function (contextRef) {
        describe('Yoda\'s abilities', function () {
            it('should cost 5 resources when not controlling 7 resources or more', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: 5,
                        hand: ['yoda#begun-the-clone-war-has'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should cost 2 less resources when controlling 7 or more resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: 7,
                        hand: ['yoda#begun-the-clone-war-has'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                });
                const { context } = contextRef;

                expect(context.yoda.printedCost).toBe(5);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should create a Clone Trooper token when played and give it Sentinel for the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['yoda#begun-the-clone-war-has'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();

                const clones = context.player1.findCardsByName('clone-trooper');
                expect(clones.length).toBe(1);
                expect(clones[0].exhausted).toBeTrue();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([clones[0]]);
                context.player2.clickCard(clones[0]);

                expect(context.player1).toBeActivePlayer();
            });

            it('should create a Clone Trooper token when played and give it Sentinel for the phase (move to next action phase)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['yoda#begun-the-clone-war-has'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();

                const clones = context.player1.findCardsByName('clone-trooper');
                expect(clones.length).toBe(1);
                expect(clones[0].exhausted).toBeTrue();

                context.moveToNextActionPhase();

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([clones[0], context.yoda, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(4);
            });

            it('should create a Clone Trooper token with Sentinel for the phase when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#begun-the-clone-war-has'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.yoda);

                expect(context.player1).toBeActivePlayer();
                const clones = context.player1.findCardsByName('clone-trooper');
                expect(clones.length).toBe(1);
                expect(clones[0].exhausted).toBeTrue();

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([clones[0]]);
                context.player2.clickCard(clones[0]);

                expect(context.player1).toBeActivePlayer();
            });

            it('should create a Clone Trooper token with Sentinel for the phase when defeated (move to next action phase)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#begun-the-clone-war-has'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.yoda);

                expect(context.player1).toBeActivePlayer();
                const clones = context.player1.findCardsByName('clone-trooper');
                expect(clones.length).toBe(1);
                expect(clones[0].exhausted).toBeTrue();

                context.moveToNextActionPhase();

                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([clones[0], context.p1Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(6);
            });

            it('should create a Clone Trooper token with Sentinel for the phase when defeated (No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#begun-the-clone-war-has', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.yoda);

                expect(context.player1).toBeActivePlayer();
                const clones = context.player2.findCardsByName('clone-trooper');
                expect(clones.length).toBe(1);
                expect(clones[0].exhausted).toBeTrue();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([clones[0]]);
                context.player1.clickCard(clones[0]);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
