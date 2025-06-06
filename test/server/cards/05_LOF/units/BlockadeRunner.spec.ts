describe('Blockade Runner', function() {
    integration(function(contextRef) {
        describe('Blockade Runner\'s on attack ability', function() {
            it('should get an Experience token when attacking the base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['blockade-runner'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blockadeRunner);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to this unit');

                context.player1.clickPrompt('Trigger');
                expect(context.blockadeRunner).toHaveExactUpgradeNames(['experience']);
                expect(context.p2Base.damage).toBe(4);
            });

            it('does nothing when attacking a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['blockade-runner'],
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blockadeRunner);
                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.player2).toBeActivePlayer();
            });

            it('should get an Experience token when damaging the base with overwhelm', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'blockade-runner', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blockadeRunner);
                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                context.player1.clickCard(context.heroicResolve);
                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to this unit');

                context.player1.clickPrompt('Trigger');
                expect(context.blockadeRunner).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing when an enemy unit attacks base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['blockade-runner'],
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.concordDawnInterceptors);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('does nothing when a friendly unit attacks base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['blockade-runner'],
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});