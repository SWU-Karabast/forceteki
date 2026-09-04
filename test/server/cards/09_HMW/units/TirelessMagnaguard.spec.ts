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

            it('should allow it to be replayed repeatedly if it is pumped back up to 5 power before each defeat', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['commence-the-festivities', 'commence-the-festivities'],
                        groundArena: ['tireless-magnaguard'],
                        resources: 5
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa', 'atst'],
                        resources: 10,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;
                const [commenceTheFestivities1, commenceTheFestivities2] = context.player1.findCardsByName('commence-the-festivities');

                // ROUND 1: Player 2 defeats Tireless Magnaguard while it has 5 power, Player 1 replays it for free
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.tirelessMagnaguard);
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);

                let readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);
                expect(context.tirelessMagnaguard.exhausted).toBeTrue();

                // ROUND 2: Commence the Festivities gives it +2/+0 for the attack (Player 1 controls fewer resources),
                // so it is defeated in combat with 5 power and can be replayed again
                context.moveToNextActionPhase();
                expect(context.tirelessMagnaguard.exhausted).toBeFalse();

                context.player2.passAction();
                context.player1.clickCard(commenceTheFestivities1);
                context.player1.clickCard(context.tirelessMagnaguard);
                context.player1.clickCard(context.wampa);

                // Wampa took 5 damage (3 base power + 2 from the pump), so both units were defeated
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);
                expect(context.tirelessMagnaguard.getHp()).toBe(1);

                // ROUND 3: same again against a different defender
                context.moveToNextActionPhase();

                context.player2.passAction();
                context.player1.clickCard(commenceTheFestivities2);
                context.player1.clickCard(context.tirelessMagnaguard);
                context.player1.clickCard(context.atst);

                // AT-ST took 5 damage (3 base power + 2 from the pump)
                expect(context.tirelessMagnaguard).toBeInZone('discard', context.player1);
                expect(context.atst.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.tirelessMagnaguard);

                expect(context.tirelessMagnaguard).toBeInZone('groundArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.tirelessMagnaguard).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.tirelessMagnaguard.getPower()).toBe(3);
                expect(context.tirelessMagnaguard.getHp()).toBe(1);
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
