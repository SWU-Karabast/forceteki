describe('Outcast, Mercenary Starship', function() {
    integration(function(contextRef) {
        describe('its triggered ability', function() {
            it('should give +1/+0 to itself for the phase when played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['outcast#mercenary-starship']
                    }
                });

                const { context } = contextRef;

                // Play Outcast — its own entry triggers the ability
                context.player1.clickCard(context.outcast);

                expect(context.outcast.getPower()).toBe(2);
                expect(context.outcast).toBeInZone('spaceArena');

                // Move to next action phase — the buff from Outcast's trigger should have expired
                context.moveToNextActionPhase();
                expect(context.outcast.getPower()).toBe(1);
            });

            it('should buff another friendly unit for the phase when it enters play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship'],
                        hand: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Outcast is already in play (not buffed from this phase's trigger)
                expect(context.outcast.getPower()).toBe(1);

                // Play a second friendly unit — Outcast's trigger fires for it
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine gets +1/+0 from Outcast
                expect(context.battlefieldMarine.getPower()).toBe(4);

                // Move to next action phase — the buff from Outcast's trigger should have expired
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should not give a buff to enemy units entering play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship']
                    },
                    player2: {
                        hand: ['black-sun-patroller']
                    }
                });

                const { context } = contextRef;

                // Opponent plays a unit — Outcast should NOT trigger for it
                context.player1.passAction();
                context.player2.clickCard(context.blackSunPatroller);

                // Enemy Black Sun Patroller receives no buff; Outcast is also unchanged
                expect(context.blackSunPatroller.getPower()).toBe(2);
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

                // The two simultaneous "enters play" triggers are grouped — resolve them via the modal
                context.player1.clickPrompt('Resolve all (2)');

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
                        leader: 'grand-inquisitor#hunting-the-jedi'
                    }
                });

                const { context } = contextRef;

                // Deploy the leader — it enters play and triggers Outcast's ability
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickPrompt('Deploy Grand Inquisitor');

                // Grand Inquisitor (printed power 3) gets +1/+0 from Outcast
                expect(context.grandInquisitor.getPower()).toBe(4);
            });

            it('should trigger when a friendly unit is rescued from capture', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'cad-bane#hostage-taker', capturedUnits: ['battlefield-marine'] }]
                    },
                    player2: {
                        spaceArena: ['outcast#mercenary-starship']
                    }
                });

                const { context } = contextRef;

                expect(context.battlefieldMarine).toBeCapturedBy(context.cadBane);

                // Player 1 attacks Player 2's base with Cad Bane — triggers the rescue ability
                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                // Player 2 rescues Battlefield Marine — it enters play and Outcast's ability triggers
                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine.getPower()).toBe(4);

                // Move to next action phase — the buff from Outcast's trigger should have expired
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should not trigger when an enemy unit changes control to the friendly player', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship']
                    },
                    player2: {
                        spaceArena: ['mercenary-gunship']
                    }
                });

                const { context } = contextRef;

                // Player 1 takes control of the enemy Mercenary Gunship — no enters-play event fires
                context.player1.clickCard(context.mercenaryGunship);

                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);

                // Mercenary Gunship's printed power (3) is unchanged — Outcast did not trigger
                expect(context.mercenaryGunship.getPower()).toBe(3);
                expect(context.outcast.getPower()).toBe(1);
            });

            it('should not trigger when a Piloting unit is played as an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outcast#mercenary-starship', 'n1-starfighter'],
                        hand: ['independent-smuggler']
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
