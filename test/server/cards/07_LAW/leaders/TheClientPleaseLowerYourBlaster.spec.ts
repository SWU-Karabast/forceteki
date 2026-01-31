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

            it('exhausts an enemy unit if a token was created this phase', async function() {
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

            it('exhausts an enemy unit if a token was created this phase', async function() {
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
        });
    });
});
