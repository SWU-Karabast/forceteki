describe('Wicket, Few Greater Battles to Fight', function () {
    integration(function (contextRef) {
        describe('Wicket\'s leader side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wicket#few-greater-battles-to-fight',
                        groundArena: ['wampa'],
                        deck: ['yoda#old-master', 'bravado']
                    },
                    player2: {
                        groundArena: ['porg', 'atst', 'echo#restored']
                    }
                });
            });

            it('should trigger when attacking a unit that costs more than the attacker, allowing the player to exhaust the leader and draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('hand', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
                expect(context.wicket.exhausted).toBeTrue();
            });

            it('should not trigger when attacking a unit that does not cost more than the attacker', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('deck', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
            });

            it('should not trigger when attacking another unit that cost the same as the attacker', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.echo);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('deck', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
            });

            it('should not trigger when attacking the enemy base directly', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('deck', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
            });

            it('should not trigger when the opponent declares the attack', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.porg);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Wicket\'s leader unit side ability', function () {
            it('should draw a card on attack when a friendly unit in play costs 3 or less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'wicket#few-greater-battles-to-fight', deployed: true },
                        groundArena: ['yoda#old-master'],
                        deck: ['porg', 'bravado']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wicket);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('hand', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
            });

            it('should deal damage to the player\'s base instead of drawing when the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'wicket#few-greater-battles-to-fight', deployed: true },
                        groundArena: ['yoda#old-master'],
                        deck: []
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wicket);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not draw a card on attack when no friendly unit in play costs 3 or less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'wicket#few-greater-battles-to-fight', deployed: true },
                        groundArena: ['wampa'],
                        deck: ['porg', 'bravado']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wicket);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('deck', context.player1);
                expect(context.bravado).toBeInZone('deck', context.player1);
            });
        });
    });
});
