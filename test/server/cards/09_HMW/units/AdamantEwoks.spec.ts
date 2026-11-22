describe('Adamant Ewoks', function() {
    integration(function(contextRef) {
        describe('Adamant Ewoks\'s ability', function() {
            it('should not trigger when no other Ewok unit is controlled and no Endor base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['adamant-ewoks'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        groundArena: ['atst', 'village-tender'],
                        base: 'shield-generator-complex'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.adamantEwoks);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should deal 1 damage to a base and 1 damage to an enemy unit when you control another Ewok unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['adamant-ewoks'],
                        groundArena: ['village-tender']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.adamantEwoks);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a base and 1 damage to an enemy unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
            });

            it('may be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['adamant-ewoks'],
                        groundArena: ['village-tender']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.adamantEwoks);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a base and 1 damage to an enemy unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
                expect(context.awing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should deal 1 damage to a base even if there is no enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['adamant-ewoks'],
                        groundArena: ['village-tender']
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.adamantEwoks);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a base and 1 damage to an enemy unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
            });

            it('should deal 1 damage to a base and 1 damage to an enemy unit when you control an Endor base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['adamant-ewoks'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.adamantEwoks);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a base and 1 damage to an enemy unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.awing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
