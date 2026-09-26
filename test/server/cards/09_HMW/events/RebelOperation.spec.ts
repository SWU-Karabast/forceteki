describe('Rebel Operation', function() {
    integration(function(contextRef) {
        describe('its cost reduction ability', function() {
            it('should apply no discount when there are no friendly Rebel units and the leader is not Rebel', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        hand: ['rebel-operation'],
                        groundArena: ['wampa'],
                        spaceArena: ['n1-starfighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // No discount, costs 4 (4-2)
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should reduce the cost when friendly non-leader Rebel units are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        hand: ['rebel-operation'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // Two friendly rebels (one in space and one on ground).  Ignores opponent rebel unit and friendly non rebel unit.  Costs 2 (4-2)
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should reduce the cost by 1 for an undeployed friendly Rebel leader with no Rebel units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#dedicated-to-the-rebellion',
                        hand: ['rebel-operation']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // Friendly Rebel Leader, cost 3 (4-1)
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should count a deployed Rebel leader unit alongside friendly Rebel units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        hand: ['rebel-operation'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // Two friendly Rebel units, and a deployed Rebel leader, cost 1 (4-3)
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should count a Rebel leader deployed as an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        hand: ['rebel-operation'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Deploy Pilot Luke
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.rebelOperation);

                // Rebel Pilot Upgrade in place, cost 3 (4-1)
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should apply the aspect penalty before the Rebel discount', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#alliance-general',
                        base: 'chopper-base',
                        hand: ['rebel-operation'],
                        groundArena: ['battlefield-marine', 'rebel-pathfinder']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // Base cost 6 after aspect penalty.  Two Rebel units in play and undeployed Rebel leader.  Cost 3 (6-3)
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should reduce the cost when friendly units are given Rebel from upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        hand: ['rebel-operation'],
                        groundArena: [{ card: 'wampa', upgrades: ['fulcrum'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // One friendly unit made Rebel by upgrade, cost 3 (4-1)
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        describe('its draw ability', function() {
            it('should draw the top 2 cards of the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        hand: ['rebel-operation'],
                        deck: ['atst', 'wampa', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1.handSize).toBe(2);
                expect(context.atst).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1.deck.length).toBe(1);
                expect(context.player1.deck[0]).toBe(context.cartelSpacer);
            });

            it('should still draw 2 cards when the cost is reduced to 0', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        hand: ['rebel-operation'],
                        groundArena: ['battlefield-marine', 'rebel-pathfinder', 'partisan-insurgent', 'echo-base-defender'],
                        spaceArena: ['alliance-xwing'],
                        deck: ['atst', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rebelOperation);

                // Five friendly Rebel non-leader units, cost 0
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.handSize).toBe(2);
                expect(context.atst).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');
            });
        });
    });
});
