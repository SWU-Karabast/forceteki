describe('Neel, The Cutest Boy', function() {
    integration(function(contextRef) {
        describe('its When Played / On Attack ability', function() {
            describe('When Played trigger', function() {
                it('should cause the next 1-power unit played this phase to enter play ready', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);

                    // Play warrior-drone (printed power 1) — should enter play ready
                    context.player2.passAction();
                    context.player1.clickCard(context.warriorDrone);

                    expect(context.warriorDrone).toBeInZone('groundArena');
                    expect(context.warriorDrone.exhausted).toBe(false);

                    // Confirm readiness by attacking with the warrior-drone
                    context.player2.passAction();
                    context.player1.clickCard(context.warriorDrone);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(1);
                });

                it('should cause a 0-power unit played this phase to enter play ready', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'moisture-farmer']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);

                    // Play moisture-farmer (printed power 0) — should also enter play ready
                    context.player2.passAction();
                    context.player1.clickCard(context.moistureFarmer);

                    expect(context.moistureFarmer).toBeInZone('groundArena');
                    expect(context.moistureFarmer.exhausted).toBe(false);
                });

                it('should not cause a 2-power unit to enter play ready', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'reckless-rebel']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);

                    // Play reckless-rebel (printed power 2) — should NOT enter play ready
                    context.player2.passAction();
                    context.player1.clickCard(context.recklessRebel);

                    expect(context.recklessRebel).toBeInZone('groundArena');
                    expect(context.recklessRebel.exhausted).toBe(true);
                });

                it('should only apply to the first qualifying unit played — effect is consumed on use', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'reckless-rebel', 'warrior-drone', 'ant-droid']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);
                    context.player2.passAction();

                    // Play a 2-power unit — does not qualify, effect persists
                    context.player1.clickCard(context.recklessRebel);
                    expect(context.recklessRebel.exhausted).toBe(true);
                    context.player2.passAction();

                    // Play the first 1-power unit — qualifies, enters ready, effect consumed
                    context.player1.clickCard(context.warriorDrone);
                    expect(context.warriorDrone.exhausted).toBe(false);
                    context.player2.passAction();

                    // Play a second 1-power unit — effect already consumed, enters exhausted
                    context.player1.clickCard(context.antDroid);
                    expect(context.antDroid.exhausted).toBe(true);
                });

                it('should not cause Neel himself to enter play ready', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel — the effect is registered after Neel enters play and does not retroactively ready him
                    context.player1.clickCard(context.neel);

                    expect(context.neel).toBeInZone('groundArena');
                    expect(context.neel.exhausted).toBe(true);
                });

                it('should ready Neel when he is bounced and replayed — the pending matcher applies to him on re-entry', async function() {
                    // The matcher is a phase-long player effect, so it persists after Neel leaves play.
                    // When Neel is replayed his printed power 1 qualifies, so the prior matcher readies him on entry.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy']
                        },
                        player2: {
                            hand: ['waylay']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel — registers the matcher; Neel himself enters exhausted (already covered above)
                    context.player1.clickCard(context.neel);

                    // P2 plays Waylay targeting Neel, returning him to P1's hand
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.neel);
                    expect(context.neel).toBeInZone('hand', context.player1);

                    // Replay Neel — the still-pending matcher from the first play readies him as he enters
                    context.player1.clickCard(context.neel);

                    expect(context.neel).toBeInZone('groundArena');
                    expect(context.neel.exhausted).toBe(false);
                });

                it('should not apply to units played in the next action phase', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);

                    // Advance to the next action phase without consuming the effect
                    context.moveToNextActionPhase();

                    // Play warrior-drone — effect has expired, enters exhausted
                    context.player1.clickCard(context.warriorDrone);

                    expect(context.warriorDrone).toBeInZone('groundArena');
                    expect(context.warriorDrone.exhausted).toBe(true);
                });
            });

            describe('On Attack trigger', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['warrior-drone'],
                            groundArena: ['neel#the-cutest-boy'],
                        },
                    });
                });

                it('should cause the next 1-power unit played this phase to enter play ready when Neel attacks', function() {
                    const { context } = contextRef;

                    // Attack with Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(1);

                    // Play warrior-drone (printed power 1) — should enter play ready
                    context.player2.passAction();
                    context.player1.clickCard(context.warriorDrone);

                    expect(context.warriorDrone).toBeInZone('groundArena');
                    expect(context.warriorDrone.exhausted).toBe(false);
                });

                it('should not apply to units played in the next action phase', function() {
                    const { context } = contextRef;

                    // Attack with Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);
                    context.player1.clickCard(context.p2Base);

                    // Advance without consuming the effect
                    context.moveToNextActionPhase();

                    // Play warrior-drone next phase — effect expired, enters exhausted
                    context.player1.clickCard(context.warriorDrone);

                    expect(context.warriorDrone).toBeInZone('groundArena');
                    expect(context.warriorDrone.exhausted).toBe(true);
                });
            });

            it('should apply the ready effect at entry, before Ambush fires', async function() {
                // Mysterious Hermit (printed power 1, Ambush). Under a correct "enters play ready"
                // implementation, Neel's effect applies at entry — no separate trigger appears in
                // the When Played window, so the player cannot pick "Ambush, then ready me" to get
                // two attacks. The hermit's Ambush attack should be his only attack this turn.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mysterious-hermit'],
                        groundArena: ['neel#the-cutest-boy'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // Attack with Neel, triggering the On Attack effect
                context.player1.clickCard(context.neel);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play Mysterious Hermit — should enter ready and surface only the Ambush prompt
                context.player1.clickCard(context.mysteriousHermit);

                // Hermit is ready in the ground arena when Ambush triggers
                expect(context.mysteriousHermit).toBeInZone('groundArena');
                expect(context.mysteriousHermit.exhausted).toBe(false);

                // Resolve Ambush attack
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Hermit's one attack came from Ambush — he must be exhausted afterward.
                expect(context.mysteriousHermit.exhausted).toBe(true);
            });

            it('should not apply to created token units, and should leave the effect available for later', async function() {
                // Per CR 3.7.2 tokens are CREATED, not PLAYED. Neel says "the next unit you PLAY",
                // so token creation must neither receive the ready nor consume the pending matcher.
                // Kraken creates 2 Battle Droid tokens (printed power 1) when played; Kraken
                // himself is printed power 2 and does not match the predicate.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kraken#confederate-tactician', 'warrior-drone'],
                        groundArena: ['neel#the-cutest-boy']
                    },
                });

                const { context } = contextRef;

                // Attack with Neel, queuing the matcher (one pending)
                context.player1.clickCard(context.neel);
                context.player1.clickCard(context.p2Base);

                // Play Kraken — its When Played creates 2 Battle Droid tokens. The tokens
                // must enter exhausted (token creation is not "playing").
                context.player2.passAction();
                context.player1.clickCard(context.kraken);

                const battleDroidTokens = context.player1.findCardsByName('battle-droid');
                expect(battleDroidTokens.length).toBe(2);
                for (const token of battleDroidTokens) {
                    expect(token.exhausted).toBe(true);
                }

                // Matcher must still be available — confirmed by playing a 1-power unit next.
                context.player2.passAction();
                context.player1.clickCard(context.warriorDrone);
                expect(context.warriorDrone).toBeInZone('groundArena');
                expect(context.warriorDrone.exhausted).toBe(false);
            });

            it('should ready only one unit when both When Played/On Attack fire from Ambush', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'energy-conversion-lab',
                        hand: ['neel#the-cutest-boy', 'ant-droid', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                // ECL Epic Action plays Neel with Ambush. Resolve Neel's When Played first.
                context.player1.clickCard(context.energyConversionLab);
                context.player1.clickCard(context.neel);
                context.player1.clickPrompt('The next unit you play this phase with 1 or less power enters play ready');

                // Resolve Ambush
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // First 1-power unit enters ready — both matchers' limits increment
                context.player2.passAction();
                context.player1.clickCard(context.antDroid);
                expect(context.antDroid.exhausted).toBe(false);

                // Second 1-power unit enters exhausted — both matchers consumed
                context.player2.passAction();
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer.exhausted).toBe(true);
            });

            it('should not consume the matcher when a 1-power leader is deployed (leaders are deployed, not played)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'c3po#humancyborg-relations',
                        hand: ['warrior-drone'],
                        groundArena: ['neel#the-cutest-boy']
                    },
                });

                const { context } = contextRef;

                // Attack with Neel, registering the matcher
                context.player1.clickCard(context.neel);
                context.player1.clickCard(context.p2Base);

                // Deploy C-3PO (1 power) — must not consume the matcher
                context.player2.passAction();
                context.player1.clickCard(context.c3po);
                context.player1.clickPrompt('Deploy C-3PO');

                // Matcher still active — warrior-drone (1 power) entering ready confirms this
                context.player2.passAction();
                context.player1.clickCard(context.warriorDrone);
                expect(context.warriorDrone.exhausted).toBe(false);
            });

            it('should not consume the matcher when a 1-power unit re-enters via rescue from capture', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fell-the-dragon', 'warrior-drone'],
                        groundArena: ['neel#the-cutest-boy']
                    },
                    player2: {
                        groundArena: [
                            {
                                card: 'cad-bane#hostage-taker',
                                capturedUnits: [{ card: 'ant-droid', owner: 'player1' }],
                            },
                        ],
                    },
                });

                const { context } = contextRef;

                // Attack with Neel, registering the matcher
                context.player1.clickCard(context.neel);
                context.player1.clickCard(context.p2Base);

                // Defeat Cad Bane — captured ant-droid is rescued to P1's ground arena
                context.player2.passAction();
                context.player1.clickCard(context.fellTheDragon);
                context.player1.clickCard(context.cadBane);

                // Rescued unit enters exhausted (per CR 8.34) and the matcher is not consumed
                expect(context.antDroid).toBeInZone('groundArena', context.player1);
                expect(context.antDroid.exhausted).toBe(true);

                // Matcher still active — warrior-drone (1 power) entering ready confirms this
                context.player2.passAction();
                context.player1.clickCard(context.warriorDrone);
                expect(context.warriorDrone.exhausted).toBe(false);
            });

            it('should still consume the matcher when a qualifying unit enters ready via its own ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#wonderful-human-being',
                        hand: ['salacious-crumb#cackling-companion', 'warrior-drone'],
                        groundArena: ['neel#the-cutest-boy']
                    },
                });

                const { context } = contextRef;

                // Attack with Neel, registering the matcher
                context.player1.clickCard(context.neel);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play Salacious Crumb — enters ready via his own ability
                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb.exhausted).toBe(false);

                // Matcher was consumed even though Crumb didn't need it — warrior-drone enters exhausted
                context.player2.passAction();
                context.player1.clickCard(context.warriorDrone);
                expect(context.warriorDrone.exhausted).toBe(true);
            });

            describe('printed power checks', function() {
                it('should use printed power, not modified power — a 1-printed-power unit buffed to 2+ still qualifies', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone'],
                            spaceArena: ['outcast#mercenary-starship']
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel — Outcast's trigger and Neel's When Played trigger both fire;
                    // P1 chooses which to resolve first
                    context.player1.clickCard(context.neel);
                    context.player1.clickPrompt('The next unit you play this phase with 1 or less power enters play ready');

                    // Play warrior-drone — modified power is 2 due to Outcast, but printed power is 1, so it qualifies
                    context.player2.passAction();
                    context.player1.clickCard(context.warriorDrone);

                    expect(context.warriorDrone).toBeInZone('groundArena');
                    expect(context.warriorDrone.exhausted).toBe(false);
                });

                it('should use printed power, not modified power — a 3-printed-power unit debuffed to 1 does not qualify', async function() {
                    // Supreme Leader Snoke gives all enemy non-leader units -2/-2.
                    // battlefield-marine has printed power 3 but modified power 1 when Snoke is in play.
                    // Neel's ability checks printed power, so battlefield-marine does NOT qualify.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'battlefield-marine']
                        },
                        player2: {
                            groundArena: ['supreme-leader-snoke#shadow-ruler'],
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel, triggering the enters-ready effect
                    context.player1.clickCard(context.neel);
                    context.player2.passAction();

                    // Play battlefield-marine — printed power 3, not qualifying despite being debuffed to 1 by Snoke
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.battlefieldMarine).toBeInZone('groundArena');
                    expect(context.battlefieldMarine.exhausted).toBe(true);
                });

                it('should enter ready when the played unit has its own constant power-buff ability and its printed power qualifies', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['97th-legion#keeping-the-peace-on-sullust'],
                            groundArena: ['neel#the-cutest-boy'],
                            resources: 10,
                        },
                    });

                    const { context } = contextRef;

                    // Attack with Neel, registering the matcher
                    context.player1.clickCard(context.neel);
                    context.player1.clickCard(context.p2Base);
                    context.player2.passAction();

                    // Play 97th Legion — printed power 0 qualifies; modified power is 10 once it enters play
                    context.player1.clickCard(context._97thLegion);

                    expect(context._97thLegion).toBeInZone('groundArena');
                    expect(context._97thLegion.getPower()).toBe(10);
                    expect(context._97thLegion.exhausted).toBe(false);
                });

                it('should enter ready when a friendly unit\'s constant ability buffs the played unit and its printed power qualifies', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['alliance-dispatcher'],
                            groundArena: [
                                'neel#the-cutest-boy',
                                { card: 'wampa', upgrades: ['fulcrum'] },
                            ],
                        },
                    });

                    const { context } = contextRef;

                    // Attack with Neel, registering the matcher
                    context.player1.clickCard(context.neel);
                    context.player1.clickCard(context.p2Base);
                    context.player2.passAction();

                    // Play Alliance Dispatcher — printed power 1 qualifies; modified power is 3 once it enters play
                    context.player1.clickCard(context.allianceDispatcher);

                    expect(context.allianceDispatcher).toBeInZone('groundArena');
                    expect(context.allianceDispatcher.getPower()).toBe(3);
                    expect(context.allianceDispatcher.exhausted).toBe(false);
                });
            });
        });
    });
});
