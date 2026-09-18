describe('Tireless Magnaguard', function() {
    integration(function(contextRef) {
        describe('Tireless Magnaguard\'s When Defeated ability', function() {
            it('should allow its owner to play it from their discard pile for free this phase and give it 2 Weakness tokens if it had 5 or more power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tireless-magnaguard']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Tireless Magnaguard while it has 5 power
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();

                // Player 1 plays it from their discard pile for free
                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);
                expect(context.tirelessMagnaguard.getHp()).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow it to be played again if it is defeated again with less than 5 power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tireless-magnaguard']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);

                // Player 1 plays it from their discard pile, it comes back as a 3/1
                context.player1.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);

                // Player 2 defeats it again while it has 3 power
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();

                // Player 1 can no longer play it from their discard pile
                expect(context.tirelessMagnaguard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should allow it to be replayed repeatedly in the same phase as long as it has 5 or more power each time it is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'lair-of-grievous',
                        hand: ['commence-the-festivities', 'tactical-advantage', 'tactical-advantage'],
                        groundArena: ['tireless-magnaguard'],
                        resources: 10
                    },
                    player2: {
                        hand: ['vanquish', 'vanquish'],
                        groundArena: ['wampa'],
                        resources: 15
                    }
                });

                const { context } = contextRef;
                const [tacticalAdvantage1, tacticalAdvantage2] = context.player1.findCardsByName('tactical-advantage');
                const [vanquish1, vanquish2] = context.player2.findCardsByName('vanquish');

                // CYCLE 1: Commence the Festivities attacks with it at 7 power (5 + 2, since Player 1 controls fewer
                // resources), so it trades with Wampa and is defeated with 5 or more power
                context.player1.clickCard(context.commenceTheFestivities);
                context.player1.clickCard(context.tirelessMagnaguard);
                context.player1.clickCard(context.wampa);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player2);

                context.player2.passAction();

                let readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);

                // CYCLE 2: still the same action phase. Tactical Advantage puts it back to 5 power before it is
                // defeated again, so the When Defeated ability grants a fresh permission to play it from the discard pile
                context.player2.passAction();
                context.player1.clickCard(tacticalAdvantage1);
                context.player1.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard.getPower()).toBe(5);

                context.player2.clickCard(vanquish1);
                context.player2.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);

                // CYCLE 3: still the same action phase, third time it is played from the discard pile
                context.player2.passAction();
                context.player1.clickCard(tacticalAdvantage2);
                context.player1.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard.getPower()).toBe(5);

                context.player2.clickCard(vanquish2);
                context.player2.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow it to be played from the discard pile if it had less than 5 power when defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'tireless-magnaguard', upgrades: ['weakness'] }]
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                expect(context.tirelessMagnaguard.getPower()).toBe(4);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();

                expect(context.tirelessMagnaguard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should count power modifiers when checking if it had 5 or more power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'tireless-magnaguard', upgrades: ['weakness', 'experience'] }]
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                expect(context.tirelessMagnaguard.getPower()).toBe(5);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
            });

            it('should not allow it to be played from the discard pile in a later phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tireless-magnaguard']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                context.moveToNextActionPhase();

                expect(context.tirelessMagnaguard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should not be free when it is returned from the discard pile to hand and played from hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'lair-of-grievous',
                        hand: ['renewed-friendship'],
                        groundArena: ['tireless-magnaguard'],
                        resources: 15
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats it while it has 5 power, so Player 1 may play it from their discard pile for free
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                // Renewed Friendship returns it from the discard pile to hand instead
                context.player1.clickCard(context.renewedFriendship);
                context.player1.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('hand', context.player1);

                context.player2.passAction();

                // Playing it from hand costs full price and does not give it Weakness tokens
                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount - 4);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames([]);
                expect(context.tirelessMagnaguard.getPower()).toBe(5);
                expect(context.tirelessMagnaguard.getHp()).toBe(3);
            });

            it('should not allow the opponent to play it from its owner\'s discard pile when it is defeated under their control by No Glory, Only Results', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results']
                    },
                    player2: {
                        groundArena: ['tireless-magnaguard']
                    }
                });

                const { context } = contextRef;

                // Player 1 takes control of Tireless Magnaguard and defeats it
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();

                // The ability resolved for player 1, so the owner does not get to play it from their discard pile
                expect(context.tirelessMagnaguard).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                // Player 1 cannot play it from player 2's discard pile
                expect(context.tirelessMagnaguard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});
