describe('Jyn Erso, Time to Fight', () => {
    integration(function(contextRef) {
        describe('Leader side action ability', function() {
            it('if a friendly Rebel unit was defeated this phase, search the top 3 cards of your deck for a card and draw it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        resources: 4,
                        groundArena: ['battlefield-marine'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans,
                        context.homeOne
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.deathStarPlans);

                expect(context.deathStarPlans).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
            });

            it('if no friendly Rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        resources: 4,
                        hand: [],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    }
                });

                const { context } = contextRef;

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHaveNoEffectAbilityPrompt('Search the top 3 cards of your deck for a card and draw it');
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used, but no cards were drawn
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
            });

            it('if an enemy rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        hand: ['takedown'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // P1 defeats P2's Battlefield Marine with Takedown
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                context.player1.clickPrompt('(No effect) Search the top 3 cards of your deck for a card and draw it');
                expect(context.player1).toHaveNoEffectAbilityPrompt('Search the top 3 cards of your deck for a card and draw it');
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used, but no cards were drawn
                expect(context.player1.exhaustedResourceCount).toBe(5); // Takedown cost + Jyn's ability cost
                expect(context.jynErso.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
            });

            it('if a friendly non-Rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        resources: 4,
                        groundArena: ['crafty-smuggler'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Crafty Smuggler with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toBeInZone('discard');

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHaveNoEffectAbilityPrompt('Search the top 3 cards of your deck for a card and draw it');
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used, but no cards were drawn
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
            });

            it('if a friendly unit that had gained the Rebel trait from another card was defeated this phase, the ability works', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        resources: 4,
                        groundArena: [{ card: 'crafty-smuggler', upgrades: ['nemiks-manifesto'] }],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Crafty Smuggler with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toBeInZone('discard');

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans,
                        context.homeOne
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.homeOne);

                expect(context.homeOne).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
            });

            it('can be used even if there are fewer than 3 cards in the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        resources: 4,
                        groundArena: ['battlefield-marine'],
                        deck: ['confiscate', 'death-star-plans']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.confiscate);

                expect(context.confiscate).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
            });

            it('can be used even if there are no cards in the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#time-to-fight',
                        base: { card: 'echo-base', damage: 0 },
                        resources: 4,
                        groundArena: ['battlefield-marine'],
                        deck: []
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 uses Jyn's ability
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toHaveNoEffectAbilityPrompt('Search the top 3 cards of your deck for a card and draw it');
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used, but no cards were drawn
                expect(context.p1Base.damage).toBe(0); // No draw damage due to seach failing
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.jynErso.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(0);
            });
        });

        describe('Leader Unit side on attack ability', function() {
            // It's the same as the leader side ability, except it triggers on attack instead of an action ability
            it('if a friendly Rebel unit was defeated this phase, search the top 3 cards of your deck for a card and draw it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        groundArena: ['battlefield-marine'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is automatically triggered (not optional)
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans,
                        context.homeOne
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.confiscate);

                expect(context.confiscate).toBeInZone('hand', context.player1);
            });

            it('if no friendly Rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        hand: [],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    }
                });

                const { context } = contextRef;

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped, it is P2's turn now
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('if an enemy rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        hand: ['takedown'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // P1 defeats P2's Battlefield Marine with Takedown
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped, it is P2's turn now
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('if a friendly non-Rebel unit was defeated this phase, the ability has no effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        resources: 4,
                        groundArena: ['crafty-smuggler'],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Crafty Smuggler with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toBeInZone('discard');

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped, it is P2's turn now
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('if a friendly unit that had gained the Rebel trait from another card was defeated this phase, the ability works', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        resources: 4,
                        groundArena: [{ card: 'crafty-smuggler', upgrades: ['nemiks-manifesto'] }],
                        deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Crafty Smuggler with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toBeInZone('discard');

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is automatically triggered (not optional)
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans,
                        context.homeOne
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.homeOne);

                expect(context.homeOne).toBeInZone('hand', context.player1);
            });

            it('can be used even if there are fewer than 3 cards in the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        resources: 4,
                        groundArena: ['battlefield-marine'],
                        deck: ['confiscate', 'death-star-plans']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is automatically triggered (not optional)
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.confiscate,
                        context.deathStarPlans
                    ]
                });
                context.player1.clickCardInDisplayCardPrompt(context.deathStarPlans);

                expect(context.deathStarPlans).toBeInZone('hand', context.player1);
            });

            it('has no effect if there are no cards in the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jyn-erso#time-to-fight', deployed: true },
                        base: { card: 'echo-base', damage: 0 },
                        resources: 4,
                        groundArena: ['battlefield-marine'],
                        deck: []
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // P2 defeats Battlefield Marine with Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 attacks with Jyn
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped, it is P2's turn now
                expect(context.p1Base.damage).toBe(0); // No draw damage due to seach failing
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});