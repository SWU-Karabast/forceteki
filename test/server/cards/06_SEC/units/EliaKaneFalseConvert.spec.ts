describe('Elia Kane, False Convert', function() {
    integration(function(contextRef) {
        describe('Elia Kane\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elia-kane#false-convert']
                    },
                    player2: {
                        deck: ['pyke-sentinel'],
                        resources: [
                            'atst',
                            'restock',
                            { card: 'cad-bane#impressed-now', exhausted: true },
                            { card: 'lom-pyke#dealer-in-truths', exhausted: true }
                        ]
                    }
                });
            });

            it('Elia Kane\'s when played ability should look at 3 enemy resources, showing their exhausted state', function () {
                const { context } = contextRef;

                context.game.setRandomSeed('Elia Kane test random seed');
                context.player1.clickCard(context.eliaKane);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' },
                    { card: context.lomPyke, displayText: 'Exhausted' }
                ]);

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('Defeats the selected resource and puts the top card of their deck into play as a ready resource', function () {
                const { context } = contextRef;

                context.game.setRandomSeed('Elia Kane test random seed');
                context.player1.clickCard(context.eliaKane);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' },
                    { card: context.lomPyke, displayText: 'Exhausted' }
                ]);

                context.player1.clickCardInDisplayCardPrompt(context.restock);

                // Cards were moved to the correct zones
                expect(context.restock).toBeInZone('discard', context.player2);
                expect(context.pykeSentinel).toBeInZone('resource', context.player2);

                // Resources are in the correct state
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player2.readyResourceCount).toEqual(2);
                expect(context.player2.exhaustedResourceCount).toEqual(2);

                expect(context.getChatLogs(3)).toEqual([
                    'player1 plays Elia Kane',
                    'player1 uses Elia Kane to randomly select 3 cards, and to look at 3 enemy resources',
                    'player1 uses Elia Kane to defeat Restock and to move the top card of player2\'s deck to their resources and to ready it',
                ]);
            });

            it('Replaces the defeated resource with a ready resource even if the selected resource was exhausted', function () {
                const { context } = contextRef;

                context.game.setRandomSeed('Elia Kane test random seed');
                context.player1.clickCard(context.eliaKane);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' },
                    { card: context.lomPyke, displayText: 'Exhausted' }
                ]);

                context.player1.clickCardInDisplayCardPrompt(context.cadBane);

                // Cards were moved to the correct zones
                expect(context.cadBane).toBeInZone('discard', context.player2);
                expect(context.pykeSentinel).toBeInZone('resource', context.player2);

                // Resources are in the correct state
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player2.readyResourceCount).toEqual(3);
                expect(context.player2.exhaustedResourceCount).toEqual(1);
            });

            it('Allows the player to take nothing after looking at the resources', function () {
                const { context } = contextRef;

                context.game.setRandomSeed('Elia Kane test random seed');
                context.player1.clickCard(context.eliaKane);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' },
                    { card: context.lomPyke, displayText: 'Exhausted' }
                ]);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                // No cards were moved
                expect(context.restock).toBeInZone('resource', context.player2);
                expect(context.atst).toBeInZone('resource', context.player2);
                expect(context.cadBane).toBeInZone('resource', context.player2);
                expect(context.lomPyke).toBeInZone('resource', context.player2);
                expect(context.pykeSentinel).toBeInZone('deck', context.player2);

                // Resources are in the correct state
                expect(context.player2.readyResourceCount).toEqual(2);
                expect(context.player2.exhaustedResourceCount).toEqual(2);
            });
        });

        describe('Edge cases', function() {
            it('When the opponent has less than 3 resources, they can only be shown those resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elia-kane#false-convert'],
                    },
                    player2: {
                        deck: ['pyke-sentinel'],
                        resources: [
                            'restock',
                            { card: 'cad-bane#impressed-now', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.eliaKane);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' }
                ]);

                context.player1.clickCardInDisplayCardPrompt(context.restock);

                // Cards were moved to the correct zones
                expect(context.restock).toBeInZone('discard', context.player2);
                expect(context.pykeSentinel).toBeInZone('resource', context.player2);

                // Resources are in the correct state
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player2.readyResourceCount).toEqual(1);
                expect(context.player2.exhaustedResourceCount).toEqual(1);
            });

            // TODO: There isn't a good way to test 0 resources since the test setup will prompt the player to
            // select 2 cards to resource if they have none. This scenario is wildly unlikely to happen in a
            // real game anyway.
            // it('When the opponent has 0 resources, Elia Kane\'s ability does nothing', async function() {});

            it('When the opponent has no cards in their deck, they cannot put a card into play as a resource', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elia-kane#false-convert'],
                    },
                    player2: {
                        deck: [],
                        resources: [
                            'atst',
                            'restock',
                            { card: 'cad-bane#impressed-now', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.eliaKane);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    { card: context.atst, displayText: 'Ready' },
                    { card: context.restock, displayText: 'Ready' },
                    { card: context.cadBane, displayText: 'Exhausted' }
                ]);

                context.player1.clickCardInDisplayCardPrompt(context.atst);

                // Cards were moved to the correct zones
                expect(context.atst).toBeInZone('discard', context.player2);

                // No resource was put into play
                expect(context.player2.resources.length).toEqual(2);

                // Resources are in the correct state
                expect(context.player2.readyResourceCount).toEqual(1);
                expect(context.player2.exhaustedResourceCount).toEqual(1);
            });
        });
    });
});