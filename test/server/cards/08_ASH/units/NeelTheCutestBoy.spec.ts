describe('Neel, The Cutest Boy', function() {
    integration(function(contextRef) {
        describe('its When Played / On Attack ability', function() {
            describe('When Played trigger', function() {
                it('should cause the next 1-power unit played this phase to enter play ready', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone'],
                            leader: 'leia-organa#alliance-general',
                            resources: 5,
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
                            hand: ['neel#the-cutest-boy', 'moisture-farmer'],
                            leader: 'leia-organa#alliance-general',
                            resources: 5,
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
                            hand: ['neel#the-cutest-boy', 'reckless-rebel'],
                            leader: 'leia-organa#alliance-general',
                            resources: 5,
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
                            hand: ['neel#the-cutest-boy', 'reckless-rebel', 'warrior-drone', 'ant-droid'],
                            leader: 'leia-organa#alliance-general',
                            resources: 10,
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
                            hand: ['neel#the-cutest-boy'],
                            leader: 'leia-organa#alliance-general',
                            resources: 5,
                        },
                    });

                    const { context } = contextRef;

                    // Play Neel — the effect is registered after Neel enters play and does not retroactively ready him
                    context.player1.clickCard(context.neel);

                    expect(context.neel).toBeInZone('groundArena');
                    expect(context.neel.exhausted).toBe(true);
                });

                it('should not apply to units played in the next action phase', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone'],
                            leader: 'leia-organa#alliance-general',
                            resources: 10,
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
                            groundArena: [{ card: 'neel#the-cutest-boy', exhausted: false }],
                            resources: 5,
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

            describe('entry-time semantics (vs. post-entry ready)', function() {
                it('should ready the played unit BEFORE its Ambush trigger fires, leaving no ordering loophole', async function() {
                // Mysterious Hermit (printed power 1, Ambush). Under a correct "enters play ready"
                // implementation, Neel's effect applies at entry — no separate trigger appears in
                // the When Played window, so the player cannot pick "Ambush, then ready me" to get
                // two attacks. The hermit's Ambush attack should be his only attack this turn.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['mysterious-hermit'],
                            groundArena: [{ card: 'neel#the-cutest-boy', exhausted: false }],
                            resources: 5,
                        },
                        player2: {
                            groundArena: ['battlefield-marine'],
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Neel, triggering the On Attack effect
                    context.player1.clickCard(context.neel);
                    context.player1.clickCard(context.p2Base);

                    // Play Mysterious Hermit — should enter ready and surface only the Ambush prompt
                    context.player2.passAction();
                    context.player1.clickCard(context.mysteriousHermit);

                    expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                    context.player1.clickPrompt('Trigger');
                    context.player1.clickCard(context.battlefieldMarine);

                    // Hermit's one attack came from Ambush — he must be exhausted afterward.
                    // Under the broken "ready after entry" approach, the player could resolve Neel's
                    // ready effect AFTER Ambush and have a ready Hermit available for another action.
                    expect(context.mysteriousHermit.exhausted).toBe(true);
                });

                it('should not fire on token units (created, not played) — and should not consume the matcher', async function() {
                    // Per CR 3.7.2 tokens are CREATED, not PLAYED. Neel says "the next unit you PLAY",
                    // so token creation must neither receive the ready nor consume the pending matcher.
                    // Kraken creates 2 Battle Droid tokens (printed power 1) when played; Kraken
                    // himself is printed power 2 and does not match the predicate.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['kraken#confederate-tactician', 'warrior-drone'],
                            groundArena: [{ card: 'neel#the-cutest-boy', exhausted: false }],
                            resources: 10,
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
                    expect(context.warriorDrone.exhausted).toBe(false);
                });
            });

            describe('printed power checks', function() {
                it('should use printed power, not modified power — a 1-printed-power unit buffed to 2+ still qualifies', async function() {
                    // Outcast#mercenary-starship gives any friendly unit +1/+0 when it enters play,
                    // so warrior-drone has modified power 2 while in play, but printed power 1.
                    // Neel's ability checks printed power, so warrior-drone still qualifies.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['neel#the-cutest-boy', 'warrior-drone'],
                            spaceArena: ['outcast#mercenary-starship'],
                            leader: 'leia-organa#alliance-general',
                            resources: 10,
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
                            hand: ['neel#the-cutest-boy', 'battlefield-marine'],
                            leader: 'leia-organa#alliance-general',
                            resources: 10,
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
            });
        });
    });
});
