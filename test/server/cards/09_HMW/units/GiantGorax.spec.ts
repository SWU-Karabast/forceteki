describe('Giant Gorax', function () {
    integration(function (contextRef) {
        const damagePromptFunc = (context) => `${context.player1.name} deal 3 damage to a unit or base you control`;
        const damagePromptFuncNgor = (context) => `${context.player2.name} deal 3 damage to a unit or base you control`;
        const discardPrompt = 'You discard a card from your hand and defeat a resource you control';

        describe('Giant Gorax\'s on attack ability (controlling an Endor base)', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['giant-gorax'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        hand: ['protector', 'awing'],
                        groundArena: ['atst'],
                        resources: ['yoda#old-master', 'rey#skywalker']
                    }
                });
            });

            it('should deal 3 damage to an enemy base or an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.giantGorax);
                context.player1.clickCard(context.p2Base);

                const damagePrompt = damagePromptFunc(context);

                expect(context.player2).toHaveExactPromptButtons([damagePrompt, discardPrompt]);

                context.player2.clickPrompt(damagePrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p2Base]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(3);
            });

            it('should make your opponent discard a card from hand and defeat a resource', function () {
                const { context } = contextRef;

                const player2ResourceCount = context.player2.resources.length;

                context.player1.clickCard(context.giantGorax);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toHaveExactPromptButtons([damagePromptFunc(context), discardPrompt]);

                context.player2.clickPrompt(discardPrompt);

                expect(context.player2).toBeAbleToSelectExactly([context.awing, context.protector]);
                context.player2.clickCard(context.awing);

                expect(context.player2).toBeAbleToSelectExactly([context.yoda, context.rey]);
                context.player2.clickCard(context.rey);

                expect(context.player2).toBeActivePlayer();
                expect(context.rey).toBeInZone('discard');
                expect(context.awing).toBeInZone('discard');
                expect(context.player2.resources.length).toBe(player2ResourceCount - 1);
            });
        });

        it('Giant Gorax\'s on attack ability (controlling an Endor base) should make your opponent defeat a resource (no hand)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['giant-gorax'],
                    base: 'shield-generator-complex'
                },
                player2: {
                    groundArena: ['atst'],
                    resources: ['yoda#old-master', 'rey#skywalker']
                }
            });
            const { context } = contextRef;

            const player2ResourceCount = context.player2.resources.length;

            context.player1.clickCard(context.giantGorax);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toHaveExactPromptButtons([damagePromptFunc(context), discardPrompt]);

            context.player2.clickPrompt(discardPrompt);

            expect(context.player2).toBeAbleToSelectExactly([context.yoda, context.rey]);
            context.player2.clickCard(context.rey);

            expect(context.player2).toBeActivePlayer();
            expect(context.rey).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(player2ResourceCount - 1);
        });

        it('Giant Gorax\'s on attack ability (controlling an Endor base) should make your opponent discard a card from hand (no resource)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['giant-gorax'],
                    base: 'shield-generator-complex'
                },
                player2: {
                    hand: ['yoda#old-master', 'rey#skywalker'],
                    resources: []
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.giantGorax);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toHaveExactPromptButtons([damagePromptFunc(context), discardPrompt]);

            context.player2.clickPrompt(discardPrompt);

            expect(context.player2).toBeAbleToSelectExactly([context.yoda, context.rey]);
            context.player2.clickCard(context.rey);

            expect(context.player2).toBeActivePlayer();
            expect(context.rey).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(0);
        });

        describe('Giant Gorax\'s when defeated ability (controlling an Endor base)', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['giant-gorax'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['protector', 'rivals-fall', 'awing'],
                        groundArena: ['atst'],
                        resources: ['yoda#old-master', 'rey#skywalker', 'wampa', 'porg', 'echo#restored', 'wrecker#boom']
                    }
                });
            });

            it('should deal 3 damage to a enemy base or an enemy unit', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.giantGorax);

                const damagePrompt = damagePromptFunc(context);

                expect(context.player2).toHaveExactPromptButtons([damagePrompt, discardPrompt]);

                context.player2.clickPrompt(damagePrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p2Base]);
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst.damage).toBe(3);
            });

            it('should make your opponent discard a card from hand and defeat a resource', function () {
                const { context } = contextRef;

                const player2ResourceCount = context.player2.resources.length;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.giantGorax);

                expect(context.player2).toHaveExactPromptButtons([damagePromptFunc(context), discardPrompt]);

                context.player2.clickPrompt(discardPrompt);

                expect(context.player2).toBeAbleToSelectExactly([context.awing, context.protector]);
                context.player2.clickCard(context.awing);

                expect(context.player2).toBeAbleToSelectExactly([context.yoda, context.rey, context.wampa, context.porg, context.wrecker, context.echo]);
                context.player2.clickCard(context.rey);

                expect(context.player1).toBeActivePlayer();
                expect(context.rey).toBeInZone('discard');
                expect(context.awing).toBeInZone('discard');
                expect(context.player2.resources.length).toBe(player2ResourceCount - 1);
            });
        });

        describe('Giant Gorax\'s when defeated ability (No Glory Only Results, controlling an Endor base)', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['protector', 'awing'],
                        groundArena: ['giant-gorax', 'atst'],
                        resources: ['yoda#old-master', 'rey#skywalker', 'wampa', 'porg', 'echo#restored', 'wrecker#boom']
                    },
                    player2: {
                        hasInitiative: true,
                        base: 'shield-generator-complex',
                        hand: ['no-glory-only-results'],
                    }
                });
            });

            it('should deal 3 damage to a enemy base or an enemy unit', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.giantGorax);

                const damagePrompt = damagePromptFuncNgor(context);

                expect(context.player1).toHaveExactPromptButtons([damagePrompt, discardPrompt]);

                context.player1.clickPrompt(damagePrompt);

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.p1Base]);
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst.damage).toBe(3);
            });

            it('should make your opponent discard a card from hand and defeat a resource', function () {
                const { context } = contextRef;

                const player2ResourceCount = context.player1.resources.length;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.giantGorax);

                expect(context.player1).toHaveExactPromptButtons([damagePromptFuncNgor(context), discardPrompt]);
                context.player1.clickPrompt(discardPrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.protector]);
                context.player1.clickCard(context.awing);

                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.rey, context.wampa, context.porg, context.wrecker, context.echo]);
                context.player1.clickCard(context.rey);

                expect(context.player1).toBeActivePlayer();
                expect(context.rey).toBeInZone('discard');
                expect(context.awing).toBeInZone('discard');
                expect(context.player1.resources.length).toBe(player2ResourceCount - 1);
            });
        });

        it('Giant Gorax\'s on attack ability should not trigger when not controlling an Endor base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['giant-gorax'],
                    base: 'colossus'
                },
                player2: {
                    hand: ['protector', 'awing'],
                    groundArena: ['atst'],
                    resources: ['yoda#old-master', 'rey#skywalker']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.giantGorax);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('Giant Gorax\'s when defeated ability should not trigger when not controlling an Endor base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['giant-gorax'],
                    base: 'colossus'
                },
                player2: {
                    hasInitiative: true,
                    hand: ['protector', 'awing', 'rivals-fall'],
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.giantGorax);

            expect(context.player1).toBeActivePlayer();
        });

        it('Giant Gorax\'s when defeated ability should not trigger when not controlling an Endor base (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['giant-gorax'],
                    base: 'shield-generator-complex'
                },
                player2: {
                    hasInitiative: true,
                    base: 'colossus',
                    hand: ['no-glory-only-results'],
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.giantGorax);

            expect(context.player1).toBeActivePlayer();
        });
    });
});
