describe('Improvised Identity', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.';

        describe('its attach condition', function() {
            it('can only attach to ground units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['improvised-identity'],
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Improvised Identity from hand
                context.player1.clickCard(context.improvisedIdentity);

                expect(context.player1).toBeAbleToSelectExactly([
                    // Space units are not selectable
                    context.wampa
                ]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['improvised-identity']);
            });
        });

        describe('its gained action ability', function() {
            describe('search and discard behavior', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            // deck: ground unit, space unit, event — only ground unit should be selectable
                            deck: ['battlefield-marine', 'cartel-spacer', 'takedown']
                        }
                    });
                });

                it('should show only ground units as selectable during the deck search (space units and events are invalid)', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Only battlefield-marine (ground unit) is selectable; space unit and event are invalid
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        selectable: [context.battlefieldMarine],
                        invalid: [context.cartelSpacer, context.takedown]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    // Clean up the prompts — Take nothing, then pass the follow-up attack
                    context.player1.clickPrompt('Take nothing');
                    context.player1.clickPrompt('Pass attack');
                });

                it('should discard the selected ground unit and allow passing on the attack', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Select battlefield-marine — it should be discarded
                    context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                    expect(context.battlefieldMarine).toBeInZone('discard');

                    // Decline the follow-up attack so the action resolves cleanly
                    context.player1.clickPrompt('Pass attack');
                });

                it('should allow the player to decline the search (Take nothing) and still offer the optional attack', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Decline to select any card
                    context.player1.clickPrompt('Take nothing');

                    // No discard occurred — all top-three cards are still in deck
                    expect([context.battlefieldMarine, context.cartelSpacer, context.takedown]).toAllBeInZone('deck');

                    // The optional attack is still offered even with no discard; player declines
                    expect(context.player1).toHavePrompt('Attack with Wampa');
                    context.player1.clickPrompt('Pass attack');

                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should show only "Take nothing" when no ground units are in the top 3 cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                        // Only space units, events, and upgrades in top 3 — no ground units
                        deck: ['cartel-spacer', 'resilient', 'takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt(abilityTitle);

                // No selectable cards — only "Take nothing"
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [],
                    invalid: [context.cartelSpacer, context.resilient, context.takedown]
                });

                context.player1.clickPrompt('Take nothing');

                // The optional attack is still offered even when nothing was discarded; player declines
                expect(context.player1).toHavePrompt('Attack with Wampa');
                context.player1.clickPrompt('Pass attack');

                expect(context.p2Base.damage).toBe(0);
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            describe('optional attack with gained abilities', function() {
                it('should offer the attack after discarding and allow the player to decline', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['battlefield-marine', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                    // battlefield-marine was discarded
                    expect(context.battlefieldMarine).toBeInZone('discard');

                    // Attack is offered — player declines
                    context.player1.clickPrompt('Pass attack');

                    // No attack damage on base
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should grant a Raid keyword from the discarded unit, increasing damage during the attack', async function() {
                    // kage-elite has Raid 2 and Saboteur (printed)
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            // Wampa has 4 printed power; with Raid 2 it deals 6 to the base
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['kage-elite', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Deck-search prompt uses the custom activePromptTitle
                    expect(context.player1).toHavePrompt('Choose a ground unit to discard');

                    // Discard Kage Elite (Raid 2 + Saboteur)
                    context.player1.clickCardInDisplayCardPrompt(context.kageElite);
                    expect(context.kageElite).toBeInZone('discard');

                    // Follow-up attack prompt names the attacker and the source of the gained abilities
                    expect(context.player1).toHavePrompt('Attack with Wampa. It gains Kage Elite\'s abilities for this attack.');

                    // Attack the base — optional attack picker is shown directly (no separate Trigger)
                    context.player1.clickCard(context.p2Base);

                    // Wampa (4 power) + Raid 2 = 6 damage to base
                    expect(context.p2Base.damage).toBe(6);
                });

                it('should grant an On Attack ability from the discarded unit, firing it during the attack', async function() {
                    // cloudrider-veteran has: On Attack: Deal 2 damage to a base
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['cloudrider-veteran', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Cloud-Rider Veteran (On Attack: Deal 2 damage to a base)
                    context.player1.clickCardInDisplayCardPrompt(context.cloudriderVeteran);
                    expect(context.cloudriderVeteran).toBeInZone('discard');

                    // Attack p2Base — optional attack picker is shown directly
                    context.player1.clickCard(context.p2Base);

                    // On Attack fires: deal 2 damage to a base — choose p2Base
                    context.player1.clickCard(context.p2Base);

                    // p2Base takes 2 (On Attack) + 4 (Wampa combat damage) = 6 total
                    expect(context.p2Base.damage).toBe(6);
                });

                it('should grant Saboteur from the discarded unit, allowing the attacker to bypass Sentinel', async function() {
                    // kage-elite has Saboteur (and Raid 2)
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['kage-elite', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['niima-outpost-constables', 'battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Kage Elite (Saboteur)
                    context.player1.clickCardInDisplayCardPrompt(context.kageElite);

                    // Wampa gains Saboteur — can attack non-Sentinel unit or base, bypassing niima-outpost-constables Sentinel
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.niimaOutpostConstables,
                        context.battlefieldMarine,
                        context.p2Base
                    ]);

                    context.player1.clickCard(context.p2Base);

                    // Wampa (4 power) + Raid 2 (from Kage Elite) = 6 damage to base
                    expect(context.p2Base.damage).toBe(6);
                });

                it('should not retain gained abilities after the attack ends', async function() {
                    // kage-elite has Raid 2; after the attack ends the Raid should be gone
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['kage-elite', 'cartel-spacer', 'takedown', 'pyke-sentinel']
                        }
                    });

                    const { context } = contextRef;

                    // First attack via Improvised Identity — Wampa gains Raid 2 from Kage Elite
                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickCardInDisplayCardPrompt(context.kageElite);

                    // Attack p2Base with gained Raid 2 (should deal 6) — picker shows directly
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(6);

                    // Move to the next round so Wampa readies and the once-per-round limit resets
                    context.moveToNextActionPhase();

                    // Wampa is ready again — choose plain attack (not Improvised Identity)
                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt('Attack');
                    context.player1.clickCard(context.p2Base);

                    // Wampa deals only its base 4 power — Raid 2 is no longer active
                    expect(context.p2Base.damage).toBe(6 + 4);
                });
            });

            describe('once per round limit', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                            deck: ['battlefield-marine', 'pyke-sentinel', 'takedown', 'cartel-spacer']
                        }
                    });
                });

                it('should not allow the action to be used a second time in the same round', function() {
                    const { context } = contextRef;

                    // Use the action once this round (take nothing, pass the optional attack)
                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickPrompt('Take nothing');
                    context.player1.clickPrompt('Pass attack');

                    // Wampa is still ready (no exhaust cost on the action).
                    // Clicking Wampa again goes directly to attack targeting since the once-per-round
                    // action is exhausted — verify the ability button is absent.
                    context.player2.passAction();
                    context.player1.clickCard(context.wampa);

                    // The Improvised Identity action button should NOT appear
                    expect(context.player1).not.toHaveEnabledPromptButton(abilityTitle);

                    // Cancel out of the attack prompt to end cleanly
                    context.player1.clickPrompt('Cancel');

                    // Advance to the next round
                    context.moveToNextActionPhase();

                    // The action should be available again — clicking Wampa shows ability choice menu
                    context.player1.clickCard(context.wampa);
                    expect(context.player1).toHaveEnabledPromptButton(abilityTitle);

                    // Resolve it by taking nothing and passing the optional attack
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickPrompt('Take nothing');
                    context.player1.clickPrompt('Pass attack');
                });
            });

            it('should still allow the search/discard step when the attached unit is exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', exhausted: true, upgrades: ['improvised-identity'] }],
                        deck: ['battlefield-marine', 'cartel-spacer', 'takedown']
                    }
                });

                const { context } = contextRef;

                // The action has no exhaust cost. When the unit is exhausted, clicking it goes
                // directly to the deck search (no ability choice prompt since attack is unavailable).
                context.player1.clickCard(context.wampa);

                // Verify we're in the deck search prompt (not the ability selection prompt)
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine],
                    invalid: [context.cartelSpacer, context.takedown]
                });

                // Search and discard proceed normally
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Wampa is exhausted so no attack is offered — action completes without attacking
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still allow the attack when the deck is empty and nothing is discarded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt(abilityTitle);

                // Deck is empty so we skip right to the attack
                expect(context.player1).toHavePrompt('Attack with Wampa');
                context.player1.clickCard(context.p2Base);

                // Wampa deals its base 4 damage — no discard means no gained abilities, but the attack still happens
                expect(context.p2Base.damage).toBe(4);
            });

            describe('with unusual gained abilities', function() {
                it('should suppress the optional attack after gaining Loth-Wolf\'s "can\'t attack" ability', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', upgrades: ['improvised-identity'] }],
                            deck: ['lothwolf', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Loth-Wolf — its "can't attack" ability is gained, suppressing the optional attack
                    context.player1.clickCardInDisplayCardPrompt(context.lothwolf);
                    expect(context.lothwolf).toBeInZone('discard');

                    // "Can't" overrides "may" — attack is silently skipped, turn passes
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should fire Blizzard Assault AT-AT\'s triggered ability, letting the player route excess damage to another ground unit', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', upgrades: ['improvised-identity'] }],
                            deck: ['blizzard-assault-atat', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['battlefield-marine', 'wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Blizzard Assault AT-AT — gain its "defeats a unit: route excess damage" triggered ability
                    context.player1.clickCardInDisplayCardPrompt(context.blizzardAssaultAtat);
                    expect(context.blizzardAssaultAtat).toBeInZone('discard');

                    // Attack Battlefield Marine (3 HP) — Dinosaur Turtle (7 power) defeats it with 4 excess damage
                    context.player1.clickCard(context.battlefieldMarine);

                    // Gained trigger fires — route excess damage to Wampa
                    expect(context.player1).toHavePrompt('Deal the excess damage from the attack to an enemy ground unit');
                    context.player1.clickCard(context.wampa);

                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.wampa.damage).toBe(4);
                });

                it('should allow the attacker (a ground unit) to target an enemy space unit after gaining Retrofitted Airspeeder\'s abilities', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', upgrades: ['improvised-identity'] }],
                            deck: ['retrofitted-airspeeder', 'battlefield-marine', 'takedown']
                        },
                        player2: {
                            spaceArena: ['cartel-spacer']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Retrofitted Airspeeder — gain its "can attack space units" ability
                    context.player1.clickCardInDisplayCardPrompt(context.retrofittedAirspeeder);
                    expect(context.retrofittedAirspeeder).toBeInZone('discard');

                    // Dinosaur Turtle can now target the enemy space unit
                    expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.p2Base]);
                    context.player1.clickCard(context.cartelSpacer);

                    // Dinosaur Turtle (7 power - 1 for attacking space = 6) defeats Cartel Spacer (3 HP)
                    expect(context.cartelSpacer).toBeInZone('discard');
                });

                it('should grant The Stranger\'s "defender deals damage first" ability, letting Grit\'s clap-back defeat a high-HP defender', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', upgrades: ['improvised-identity'] }],
                            deck: ['the-stranger#no-survivors', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['chewbacca#pykesbane']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard The Stranger — gain Grit + the "defender deals first" replacement
                    context.player1.clickCardInDisplayCardPrompt(context.theStranger);
                    expect(context.theStranger).toBeInZone('discard');

                    // Attack Chewbacca and elect to have him deal damage first
                    context.player1.clickCard(context.chewbacca);
                    expect(context.player1).toHavePrompt('Choose how damage is dealt for this attack');
                    context.player1.clickPrompt('Defender deals damage first');

                    // Chewbacca hits Dinosaur Turtle for 4; Grit's +4 makes the return swing 11, defeating him
                    expect(context.chewbacca).toBeInZone('discard');
                    expect(context.dinosaurTurtle.damage).toBe(4);
                });

                it('should allow attacking 2 enemy units after gaining Darth Maul\'s ability', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', upgrades: ['improvised-identity'] }],
                            deck: ['darth-maul#revenge-at-last', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['battlefield-marine', 'wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Darth Maul — gain "can attack 2 units instead of 1"
                    context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
                    expect(context.darthMaul).toBeInZone('discard');

                    // Multi-target attack — select both defenders, then confirm
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickDone();

                    // Dinosaur Turtle (7 power) defeats both defenders
                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.wampa).toBeInZone('discard');
                    expect(context.dinosaurTurtle.damage).toBe(7);
                });

                it('should offer to attach the attacker as a pilot when it would be defeated, after gaining L3-37\'s replacement effect', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [
                                'atst',
                                {
                                    card: 'dinosaur-turtle',
                                    damage: 3,
                                    upgrades: ['improvised-identity']
                                },
                            ],
                            deck: ['l337#get-out-of-my-seat', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['ravenous-rathtar']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard L3-37 — gain her "would be defeated: attach to a friendly Vehicle" replacement effect
                    context.player1.clickCardInDisplayCardPrompt(context.l337);
                    expect(context.l337).toBeInZone('discard');

                    // Attack Ravenous Rathtar — mutual combat damage would defeat Dinosaur Turtle
                    context.player1.clickCard(context.ravenousRathtar);

                    // Replacement effect fires — attach Dinosaur Turtle to AT-ST instead of defeating it
                    expect(context.player1).toHavePassAbilityPrompt('Attach to a friendly Vehicle unit without a pilot on it');
                    context.player1.clickPrompt('Trigger');
                    context.player1.clickCard(context.atst);

                    // Dinosaur Turtle is now an upgrade on AT-ST, but provides no stat modifiers
                    expect(context.ravenousRathtar).toBeInZone('discard');
                    expect(context.atst).toHaveExactUpgradeNames(['dinosaur-turtle']);
                    expect(context.atst.getPower()).toBe(6);
                    expect(context.atst.getHp()).toBe(7);
                });

                it('should fire Ahsoka Tano\'s triggered ability after the attack, enabling a second attack by a different unit', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['battlefield-marine'],
                            groundArena: [
                                { card: 'dinosaur-turtle', upgrades: ['improvised-identity'] },
                                'wampa'
                            ],
                            deck: ['ahsoka-tano#i-learned-it-from-you', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard Ahsoka Tano — gain her "when attack completes: disclose Command+Heroism to attack again" ability
                    context.player1.clickCardInDisplayCardPrompt(context.ahsokaTano);
                    expect(context.ahsokaTano).toBeInZone('discard');

                    // Attack p2Base — Dinosaur Turtle survives
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(7);

                    // Gained trigger fires — disclose Battlefield Marine (provides both Command and Heroism)
                    expect(context.player1).toHavePrompt('Disclose Command, Heroism to attack with another unit');
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player2.clickDone();

                    // Follow-up attack with Wampa
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);

                    // p2Base: 7 (Dinosaur Turtle) + 4 (Wampa) = 11
                    expect(context.p2Base.damage).toBe(11);
                });

                it('should draw a card twice when Jango Fett gains his own abilities and attacks a Bounty unit (printed + gained trigger both fire)', async function() {
                    // In-play Jango already has "When this unit attacks and defeats a unit: Draw a card."
                    // Gaining it again from the discarded Jango doubles the trigger.
                    // Clone Deserter has a Bounty — Jango printed +3 = 6, gained +3 = 9 power while attacking it.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{
                                card: 'jango-fett#renowned-bounty-hunter',
                                upgrades: ['improvised-identity']
                            }],
                            deck: [
                                'jango-fett#renowned-bounty-hunter',
                                'cartel-spacer',
                                'takedown',
                                'confiscate',
                                'restock'
                            ]
                        },
                        player2: {
                            groundArena: ['clone-deserter']
                        }
                    });

                    const { context } = contextRef;

                    // Two Jango Fetts: one in play, one in the deck
                    const [p1Jango] = context.player1.findCardsByName('jango-fett#renowned-bounty-hunter', 'groundArena');
                    const [deckJango] = context.player1.findCardsByName('jango-fett#renowned-bounty-hunter', 'deck');

                    context.player1.clickCard(p1Jango);
                    context.player1.clickPrompt(abilityTitle);

                    // Discard the deck Jango — gain his abilities on top of the printed ones
                    context.player1.clickCardInDisplayCardPrompt(deckJango);
                    expect(deckJango).toBeInZone('discard');

                    // Attack Clone Deserter (Bounty, 3 HP) — Jango has +3+3 = 9 power, defeating it
                    context.player1.clickCard(context.cloneDeserter);
                    expect(context.cloneDeserter).toBeInZone('discard');

                    // Two "Draw a card" triggers fire (printed + gained) — resolve both
                    context.player1.clickPrompt('Draw a card');
                    context.player1.clickPrompt('Draw a card');

                    // Clone Deserter's Bounty — player1 (the defeater) collects it
                    context.player1.clickPrompt('Trigger');

                    // Player1 drew 2 cards from the doubled trigger
                    expect(context.player1.hand.length).toBe(3); // 3 cards drawn: 2 from Jango's abilities, 1 from the Bounty
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
