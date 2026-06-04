describe('Reforge', function() {
    integration(function(contextRef) {
        describe('Reforge\'s ability', function() {
            it('should defeat the selected upgrade and play a found upgrade on the same unit for 4 less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        deck: ['electrostaff'],
                        resources: 8
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);

                // Select the upgrade to defeat directly
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
                context.player1.clickCard(context.entrenched);

                // Entrenched is now defeated
                expect(context.entrenched).toBeInZone('discard');

                // Deck search prompt includes the name of the unit whose upgrade was defeated
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Battlefield Marine');
                context.player1.clickCardInDisplayCardPrompt(context.electrostaff);

                // The only valid attachment target is the unit the defeated upgrade was on
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // Reforge costs 2 + 2 (Vigilance aspect penalty) = 4.
                // Electrostaff costs 2 + 2 (Vigilance penalty) - 4 (discount) = 0.
                // Total exhausted = 4.
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['electrostaff']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass without selecting an upgrade from the search', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        deck: ['electrostaff'],
                        resources: 5
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);
                context.player1.clickCard(context.entrenched);

                expect(context.entrenched).toBeInZone('discard');

                // Pass on the search — take nothing
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Battlefield Marine');
                context.player1.clickPrompt('Take nothing');

                // No new upgrade is attached
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not show upgrades on enemy units as valid targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        resources: 8
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['electrostaff'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);

                // Only entrenched (on a friendly unit) is selectable; electrostaff on enemy wampa is not
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
                context.player1.clickCard(context.entrenched);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to choose which upgrade to defeat when a unit has multiple upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched', 'electrostaff'] }],
                        resources: 8
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);

                // Both upgrades on the friendly unit are directly selectable
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.electrostaff]);

                // Defeat entrenched; electrostaff should remain
                context.player1.clickCard(context.entrenched);
                expect(context.entrenched).toBeInZone('discard');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['electrostaff']);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow defeating an upgrade controlled by an opponent on a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: ['wampa'],
                        resources: 8
                    },
                    player2: {
                        hand: ['electrostaff'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player2 plays electrostaff on player1's wampa
                context.player2.clickCard(context.electrostaff);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['electrostaff']);

                // Player1 plays Reforge — the opponent-controlled upgrade on a friendly unit is selectable
                context.player1.clickCard(context.reforge);
                expect(context.player1).toBeAbleToSelectExactly([context.electrostaff]);
                context.player1.clickCard(context.electrostaff);

                expect(context.electrostaff).toBeInZone('discard', context.player2);
                expect(context.wampa).toHaveExactUpgradeNames([]);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow defeating a token upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        deck: ['electrostaff'],
                        resources: 5
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);

                // The experience token upgrade is directly selectable
                const experienceToken = context.battlefieldMarine.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([experienceToken]);
                context.player1.clickCard(experienceToken);

                // Token is defeated (set aside), unit has no upgrades
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow defeating a pilot upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        spaceArena: [{ card: 'millennium-falcon#piece-of-junk', upgrades: ['chewbacca#faithful-first-mate'] }],
                        deck: ['electrostaff'],
                        resources: 8
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);

                // The pilot (Chewbacca as upgrade) is directly selectable
                expect(context.player1).toBeAbleToSelectExactly([context.chewbacca]);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('discard');
                expect(context.millenniumFalcon).toHaveExactUpgradeNames([]);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow playing a found upgrade if its attachment restriction is not met', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        // battlefield-marine is non-unique; Moral Authority requires a unique unit
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        deck: ['moral-authority'],
                        resources: 8
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);
                context.player1.clickCard(context.entrenched);

                expect(context.entrenched).toBeInZone('discard');

                // Moral Authority requires a unique unit — battlefield-marine is non-unique, so it's invalid
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Battlefield Marine');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.moralAuthority]
                });
                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should play the found upgrade on the stolen unit before Traitorous\'s When Defeated effect returns it to the opponent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge', 'traitorous'],
                        deck: ['electrostaff'],
                        resources: 12,
                        hasInitiative: true
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Player 1 steals the enemy battlefield-marine with Traitorous
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.controller).toBe(context.player1Object);

                context.player2.passAction();

                // Player 1 plays Reforge — Traitorous on the (now friendly) stolen unit is selectable
                context.player1.clickCard(context.reforge);
                expect(context.player1).toBeAbleToSelectExactly([context.traitorous]);
                context.player1.clickCard(context.traitorous);

                // Traitorous is defeated; ifYouDo fires — search for a replacement upgrade
                expect(context.traitorous).toBeInZone('discard');
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Battlefield Marine');
                context.player1.clickCardInDisplayCardPrompt(context.electrostaff);

                // Only the stolen unit is a valid attachment target
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // Reforge fully resolves with electrostaff on the unit — then Traitorous WD fires and returns the unit to player 2
                // The electrostaff should remain on the unit now under player 2's control
                expect(context.battlefieldMarine.controller).toBe(context.player2Object);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['electrostaff']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not find a pilot unit when searching the top 8', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reforge'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        // Chewbacca is a unit in the deck, not an upgrade — should not be selectable in search
                        deck: ['chewbacca#faithful-first-mate'],
                        resources: 5
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.reforge);
                context.player1.clickCard(context.entrenched);

                expect(context.entrenched).toBeInZone('discard');

                // Chewbacca is a unit in the deck, not an upgrade — appears as invalid in the search
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Battlefield Marine');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.chewbacca]
                });
                context.player1.clickPrompt('Take nothing');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
