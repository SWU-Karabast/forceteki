describe('The Client, Please Lower Your Blaster', function() {
    integration(function(contextRef) {
        describe('The Client\'s leader undeployed ability', function() {
            it('does nothing if no tokens were created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-client#please-lower-your-blaster',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['han-solo#hibernation-sick', 'wampa'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.hanSolo);
                context.player2.clickCard(context.p1Base);
                expect(context.hanSolo.exhausted).toBeTrue();

                context.player1.clickCard(context.theClient);
                context.player1.clickPrompt('Use it anyway');
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('exhausts an enemy unit if a token upgrade was created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-client#please-lower-your-blaster',
                        resources: 3,
                        groundArena: ['han-solo#hibernation-sick', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                context.player2.claimInitiative();
                expect(context.wampa.exhausted).toBeFalse();

                context.player1.clickCard(context.theClient);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('exhausts an enemy unit if a token upgrade was created on an enemy unit this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-client#please-lower-your-blaster', deployed: true },
                        groundArena: ['finn#looking-closer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                context.player2.claimInitiative();

                context.player1.clickCard(context.theClient);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('exhausts an enemy unit if a unit token was created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-client#please-lower-your-blaster',
                        resources: 3,
                        groundArena: ['dedra-meero#with-verifiable-data', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.dedraMeero);
                context.player1.clickCard(context.p2Base);

                context.player2.claimInitiative();
                expect(context.wampa.exhausted).toBeFalse();

                context.player1.clickCard(context.theClient);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
            });
        });

        describe('The Client\'s leader deployed ability', function() {
            it('does nothing if no tokens were created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-client#please-lower-your-blaster', deployed: true },
                    },
                    player2: {
                        hand: ['unmarked-credits'],
                        groundArena: ['han-solo#hibernation-sick', 'wampa'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.unmarkedCredits);

                context.player1.clickCard(context.theClient);
                context.player1.clickCard(context.p2Base);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if only enemy tokens were created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-client#please-lower-your-blaster', deployed: true },
                        hand: ['jesse#hardfighting-patriot'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.jesse);

                context.player2.claimInitiative();

                context.player1.clickCard(context.theClient);
                context.player1.clickCard(context.p2Base);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('exhausts an enemy unit if a credit token was created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-client#please-lower-your-blaster', deployed: true },
                        hand: ['unmarked-credits'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.unmarkedCredits);

                context.player2.claimInitiative();
                expect(context.wampa.exhausted).toBeFalse();

                context.player1.clickCard(context.theClient);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('exhausts an enemy unit if the force token was created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-client#please-lower-your-blaster', deployed: true },
                        hand: ['youngling-padawan'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.younglingPadawan);

                context.player2.claimInitiative();
                expect(context.wampa.exhausted).toBeFalse();

                context.player1.clickCard(context.theClient);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.theClient.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
            });
        });
    });
});
