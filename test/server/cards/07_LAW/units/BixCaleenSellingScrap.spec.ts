describe('Bix Caleen, Selling Scrap', function () {
    integration(function (contextRef) {
        describe('When Played ability', function () {
            it('should create a Credit token when discarding a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bix-caleen#selling-scrap', 'battlefield-marine', 'wampa'],
                    },
                    player2: {
                        hand: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing the ability when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bix-caleen#selling-scrap', 'battlefield-marine'],
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);

                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bix-caleen#selling-scrap'],
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);

                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
        describe('On Attack ability', function () {
            it('should create a Credit token when discarding a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'wampa'],
                        groundArena: ['bix-caleen#selling-scrap']
                    },
                    player2: {
                        hand: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing the ability when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['bix-caleen#selling-scrap']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bix-caleen#selling-scrap'],
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bixCaleen);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
