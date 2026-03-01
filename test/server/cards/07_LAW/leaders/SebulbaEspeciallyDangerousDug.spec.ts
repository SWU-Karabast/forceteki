describe('Sebulba, Especially Dangerous Dug', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side action ability', function() {
            it('exhausts Sebulba, discards a card from deck, and gives a friendly unit Raid 1 for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3, // To prevent deploy prompt
                        deck: ['restock', 'confiscate'],
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['lurking-tie-phantom']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                // Use Sebulba's action ability and target Death Star Stormtrooper
                context.player1.clickCard(context.sebulba);
                expect(context.player1).toHavePrompt('Select a friendly unit to gain Raid 1 for this phase');
                expect(context.player1).not.toHaveChooseNothingButton(); // Must select a unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.deathStarStormtrooper,
                    context.lurkingTiePhantom
                ]);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Costs are paid
                expect(context.sebulba.exhausted).toBeTrue();
                expect(context.player1.deck.length).toBe(1);
                expect(context.restock).toBeInZone('discard');
                expect(context.confiscate).toBeInZone('deck');

                context.player2.passAction();

                // Attack with Death Star Stormtrooper to verify Raid 1
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('has no effect if there are no friendly units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3,
                        deck: ['restock', 'confiscate']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Use Sebulba's action ability
                context.player1.clickCard(context.sebulba);
                expect(context.player1).toHaveNoEffectAbilityPrompt('A friendly unit gains Raid 1 for this phase');
                context.player1.clickPrompt('Use it anyway');

                // Costs are still paid
                expect(context.sebulba.exhausted).toBeTrue();
                expect(context.player1.deck.length).toBe(1);
                expect(context.restock).toBeInZone('discard');
                expect(context.confiscate).toBeInZone('deck');

                // It is now player2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be used if the player has no cards in deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3,
                        deck: []
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Sebulba is not selectable since costs cannot be paid
                expect(context.player1).not.toBeAbleToSelect(context.sebulba);
            });
        });

        describe('Deployed unit-side On Attack ability', function() {
            it('discards a card from your deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'sebulba#especially-dangerous-dug', deployed: true },
                        deck: ['restock', 'lurking-tie-phantom']
                    },
                    player2: {
                        deck: ['battlefield-marine', 'confiscate']
                    }
                });

                const { context } = contextRef;

                // Attack with Sebulba
                context.player1.clickCard(context.sebulba);
                context.player1.clickCard(context.p2Base);

                // Non-optional, no prompt
                expect(context.player1.deck.length).toBe(1);
                expect(context.restock).toBeInZone('discard');
                expect(context.lurkingTiePhantom).toBeInZone('deck');
                expect(context.player2.deck.length).toBe(2); // Sanity check, no enemy discard
                expect(context.getChatLog()).toEqual('player1 uses Sebulba to discard Restock from their deck');
            });

            it('does nothing if the player has no cards in deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'sebulba#especially-dangerous-dug', deployed: true },
                        deck: []
                    },
                    player2: {
                        deck: ['battlefield-marine', 'confiscate']
                    }
                });

                const { context } = contextRef;

                // Attack with Sebulba
                context.player1.clickCard(context.sebulba);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.deck.length).toBe(0);
                expect(context.player2.deck.length).toBe(2); // Sanity check, no enemy discard
                expect(context.getChatLog()).toEqual('player1 attacks player2\'s base with Sebulba');
            });
        });
    });
});
