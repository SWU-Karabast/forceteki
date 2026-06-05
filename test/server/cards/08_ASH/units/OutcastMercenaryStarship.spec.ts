describe('Outcast, Mercenary Starship', function() {
    integration(function(contextRef) {
        describe('its triggered ability', function() {
            describe('when a friendly unit enters play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['outcast#mercenary-starship'],
                            resources: 4
                        }
                    });
                });

                it('should give +1/+0 to itself when played', function() {
                    const { context } = contextRef;

                    // Play Outcast — its own entry triggers the ability
                    context.player1.clickCard(context.outcast);

                    expect(context.outcast.getPower()).toBe(2);
                    expect(context.outcast).toBeInZone('spaceArena');
                });

                it('should give a buff that expires at end of phase', function() {
                    const { context } = contextRef;

                    // Play Outcast — receives +1/+0 from its own trigger
                    context.player1.clickCard(context.outcast);
                    expect(context.outcast.getPower()).toBe(2);

                    // Advance to the next phase — buff expires
                    context.moveToNextActionPhase();

                    expect(context.outcast.getPower()).toBe(1);
                });
            });

            it('should give +1/+0 to another friendly unit when it enters play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship'],
                        hand: ['tieln-fighter'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // Outcast is already in play (not buffed from this phase's trigger)
                expect(context.outcast.getPower()).toBe(1);

                // Play a second friendly unit — Outcast's trigger fires for it
                context.player1.clickCard(context.tielnFighter);

                // TIE/ln Fighter (printed power 2) gets +1/+0 from Outcast
                expect(context.tielnFighter.getPower()).toBe(3);
            });

            it('should not give a buff to enemy units entering play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship']
                    },
                    player2: {
                        hand: ['cartel-spacer'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Opponent plays a unit — Outcast should NOT trigger for it
                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);

                // Enemy Cartel Spacer receives no buff; Outcast is also unchanged
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.outcast.getPower()).toBe(1);
            });

            it('should trigger when a friendly token unit enters play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship'],
                        hand: ['droid-deployment'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // Play Droid Deployment — creates 2 Battle Droid tokens simultaneously
                context.player1.clickCard(context.droidDeployment);

                // Resolve the trigger ordering prompt for the two simultaneous "enters play" triggers
                context.player1.clickPrompt('Give the entering unit +1/+0 for this phase: Battle Droid');

                // Each Battle Droid (printed power 1) should have received +1/+0 from Outcast
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                battleDroids.forEach((droid) => expect(droid.getPower()).toBe(2));
            });

            it('should trigger when a friendly leader is deployed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship'],
                        leader: 'grand-inquisitor#hunting-the-jedi',
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Deploy the leader — it enters play and triggers Outcast's ability
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickPrompt('Deploy Grand Inquisitor');

                // Grand Inquisitor (printed power 3) gets +1/+0 from Outcast
                expect(context.grandInquisitor.getPower()).toBe(4);
            });

            it('should not trigger when a Piloting unit is played as an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship', 'n1-starfighter'],
                        hand: ['independent-smuggler'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Play Independent Smuggler as a pilot upgrade on N-1 Starfighter
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.n1Starfighter);

                expect(context.n1Starfighter).toHaveExactUpgradeNames(['independent-smuggler']);

                // No unit entered play — Outcast did not trigger
                // N-1 Starfighter (printed power 3) only has the +1 from the pilot upgrade
                expect(context.n1Starfighter.getPower()).toBe(4);
                expect(context.outcast.getPower()).toBe(1);
            });
        });
    });
});
