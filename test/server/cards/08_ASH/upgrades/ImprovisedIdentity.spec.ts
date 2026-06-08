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
                    // Loth-Wolf's printed text is "Sentinel\nThis unit can't attack." The "can't attack" portion
                    // is a constant ability and is transferred to the attacker as an attackerLastingEffect.
                    // Unconditional attackerLastingEffects are applied at the "Declare Intent" step (CR 6.3.1.1),
                    // so the gained "can't attack" is active by the time "Check Restrictions" (CR 6.3.2) runs.
                    // Per CR 8.3, "can't" overrides "may", so the optional attack from Improvised Identity is
                    // silently dropped — the search/discard portion of the action still resolves and the turn passes.
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

                    context.player1.clickCardInDisplayCardPrompt(context.lothwolf);
                    expect(context.lothwolf).toBeInZone('discard');

                    // No base damage — the gained "can't attack" constant ability prevented the attack from proceeding
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should fire Blizzard Assault AT-AT\'s triggered ability, letting the player route excess damage to another ground unit', async function() {
                    // Blizzard Assault AT-AT: "When this unit attacks and defeats a unit: You may deal the excess damage from this attack to an enemy ground unit."
                    // Dinosaur Turtle (7 power) defeats Battlefield Marine (3 HP) leaving 4 excess damage.
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

                    context.player1.clickCardInDisplayCardPrompt(context.blizzardAssaultAtat);
                    expect(context.blizzardAssaultAtat).toBeInZone('discard');

                    // Attack Battlefield Marine (3 HP) — Dinosaur Turtle deals 7, defeating it with 4 excess
                    context.player1.clickCard(context.battlefieldMarine);

                    // The gained "When this unit attacks and defeats a unit" ability fires — route excess to Wampa
                    expect(context.player1).toHavePrompt('Deal the excess damage from the attack to an enemy ground unit');
                    context.player1.clickCard(context.wampa);

                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.wampa.damage).toBe(4);
                });

                it('should allow the attacker (a ground unit) to target an enemy space unit after gaining Retrofitted Airspeeder\'s abilities', async function() {
                    // Retrofitted Airspeeder: "This unit can attack space units. While attacking a space unit, this unit gets -1/-0."
                    // Dinosaur Turtle (7 power - 1 = 6 while attacking space) should defeat Cartel Spacer (3 HP).
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

                    context.player1.clickCardInDisplayCardPrompt(context.retrofittedAirspeeder);
                    expect(context.retrofittedAirspeeder).toBeInZone('discard');

                    // Dinosaur Turtle should now be able to target the space unit
                    expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.p2Base]);
                    context.player1.clickCard(context.cartelSpacer);

                    // Dinosaur Turtle (7 power - 1 for attacking space = 6) defeats Cartel Spacer (3 HP)
                    expect(context.cartelSpacer).toBeInZone('discard');
                });

                it('should grant Grit from The Stranger, increasing power based on existing damage on the attacker', async function() {
                    // The Stranger: "Ambush, Grit, While attacking, you may have the defending unit deal combat damage before this unit."
                    // Dinosaur Turtle has 3 pre-existing damage, so Grit gives +3 power: 7 + 3 = 10 damage to base.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'dinosaur-turtle', damage: 3, upgrades: ['improvised-identity'] }],
                            deck: ['the-stranger#no-survivors', 'cartel-spacer', 'takedown']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.dinosaurTurtle);
                    context.player1.clickPrompt(abilityTitle);

                    context.player1.clickCardInDisplayCardPrompt(context.theStranger);
                    expect(context.theStranger).toBeInZone('discard');

                    // Attack p2Base — Grit adds +3 power (3 damage on attacker): 7 base + 3 = 10
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(10);
                });

                it('should allow attacking 2 enemy units after gaining Darth Maul\'s ability', async function() {
                    // Darth Maul: "This unit can attack 2 units instead of 1."
                    // Dinosaur Turtle (7 power) attacks both units; both 3 HP units are defeated.
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

                    context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
                    expect(context.darthMaul).toBeInZone('discard');

                    // Multi-target attack — click first target, then second, then Done
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickDone();

                    // Dinosaur Turtle (7 power) defeats both defenders
                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.wampa).toBeInZone('discard');
                });

                it('should offer to attach the attacker as a pilot when it would be defeated, after gaining L3-37\'s replacement effect', async function() {
                    // L3-37#get-out-of-my-seat: "If this unit would be defeated, you may instead attach her as an
                    // upgrade to a friendly Vehicle unit without a Pilot on it."
                    // When Dinosaur Turtle gains this ability via Improvised Identity, "this unit" becomes Dinosaur
                    // Turtle. If it would be defeated during the attack, the player is offered to attach
                    // Dinosaur Turtle as an upgrade to a friendly Vehicle (AT-ST).
                    //
                    // Note: Improvised Identity adds +3 HP to the attached unit (printed upgradeHp: 3),
                    // so Dinosaur Turtle's effective HP is 10. Pre-damage it by 3 so Rathtar's 8 power
                    // in combat is enough to push it past its modified HP and trigger the replacement.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [
                                { card: 'dinosaur-turtle', damage: 3, upgrades: ['improvised-identity'] },
                                'atst'
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

                    context.player1.clickCardInDisplayCardPrompt(context.l337);
                    expect(context.l337).toBeInZone('discard');

                    // Attack the enemy Ravenous Rathtar (8/5) — both would be defeated by mutual combat damage.
                    // The gained "would be defeated" replacement effect should offer attaching Dinosaur Turtle to AT-ST.
                    context.player1.clickCard(context.ravenousRathtar);

                    // Accept the replacement: attach attacker to AT-ST instead of defeating it
                    expect(context.player1).toHavePassAbilityPrompt('Attach to a friendly Vehicle unit without a pilot on it');
                    context.player1.clickPrompt('Trigger');
                    context.player1.clickCard(context.atst);

                    // Defender is defeated; attacker is now an upgrade on AT-ST instead of in the discard pile
                    expect(context.ravenousRathtar).toBeInZone('discard');
                    expect(context.atst).toHaveExactUpgradeNames(['dinosaur-turtle']);
                });

                it('should fire Ahsoka Tano\'s triggered ability after the attack, enabling a second attack by a different unit', async function() {
                    // Ahsoka: "When this unit completes an attack (and survives): You may disclose CommandHeroism. If you do, attack with another unit."
                    // Dinosaur Turtle attacks p2Base, survives, then we disclose Command+Heroism (Battlefield Marine) to attack again with Wampa.
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

                    context.player1.clickCardInDisplayCardPrompt(context.ahsokaTano);
                    expect(context.ahsokaTano).toBeInZone('discard');

                    // Attack p2Base — Dinosaur Turtle survives (attacking a base doesn't kill the attacker)
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(7);

                    // Ahsoka's "When this unit completes an attack (and survives)" triggers — disclose Command+Heroism
                    expect(context.player1).toHavePrompt('Disclose Command, Heroism to attack with another unit');
                    // Battlefield Marine provides both Command and Heroism aspects, satisfying the disclose requirement
                    context.player1.clickCard(context.battlefieldMarine);
                    // Player2 views the disclosed cards and clicks Done
                    context.player2.clickDone();

                    // Choose Wampa for the follow-up attack, target p2Base
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);

                    // p2Base now has 7 (Dinosaur Turtle) + 4 (Wampa) = 11 damage
                    expect(context.p2Base.damage).toBe(11);
                });

                it('should draw a card twice when Jango Fett gains his own abilities and attacks a Bounty unit (printed + gained trigger both fire)', async function() {
                    // Jango Fett (Renowned Bounty Hunter): "+3/+0 and Overwhelm while attacking a unit with a Bounty" + "When this unit attacks and defeats a unit: Draw a card."
                    // In-play Jango already has these abilities. Gaining them again from the discarded Jango should double "Draw a card."
                    // Clone Deserter (Bounty, 3 HP): Jango printed +3 = 6, gained +3 = 9 power while attacking the Bounty unit.
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: [],
                            groundArena: [{ card: 'jango-fett#renowned-bounty-hunter', upgrades: ['improvised-identity'] }],
                            deck: ['jango-fett#renowned-bounty-hunter', 'cartel-spacer', 'takedown']
                        },
                        player2: {
                            groundArena: ['clone-deserter']
                        }
                    });

                    const { context } = contextRef;

                    // There are two Jango Fetts: one in play (p1's), one in the deck.
                    const [p1Jango] = context.player1.findCardsByName('jango-fett#renowned-bounty-hunter', 'groundArena');
                    const [deckJango] = context.player1.findCardsByName('jango-fett#renowned-bounty-hunter', 'deck');

                    context.player1.clickCard(p1Jango);
                    context.player1.clickPrompt(abilityTitle);

                    // The deck's Jango should be in the display prompt
                    context.player1.clickCardInDisplayCardPrompt(deckJango);
                    expect(deckJango).toBeInZone('discard');

                    // Attack Clone Deserter (has Bounty) — Jango gains +3 (printed) + +3 (gained) = 9 power total while attacking
                    context.player1.clickCard(context.cloneDeserter);

                    // Clone Deserter (3 HP) is defeated; two "Draw a card" triggers fire (printed + gained).
                    // Clone Deserter also has a Bounty — since player1 defeated their own Bounty unit, player2
                    // (the opponent) resolves the Bounty. Player1 has multiple triggers to order: resolve both "Draw a card".
                    expect(context.cloneDeserter).toBeInZone('discard');

                    // Player1 must choose the order for the two "Draw a card" triggers.
                    // Resolve the first "Draw a card" trigger.
                    context.player1.clickPrompt('Draw a card');

                    // Resolve the second "Draw a card" trigger.
                    context.player1.clickPrompt('Draw a card');

                    // Clone Deserter has a Bounty. Player2 (controller of Clone Deserter) has their opponent (player1)
                    // collect it. Player1 is prompted to trigger the Bounty ability (draw a card for player1).
                    // Note: Bounty is controller-independent; it's always the defeater's/capturer's choice to collect.
                    context.player1.clickPrompt('Trigger');

                    // Player 1 should have drawn 2 cards (printed + gained trigger)
                    // TODO: If the gained "When this unit attacks and defeats a unit" ability does NOT fire a second
                    // time (engine does not double-trigger gained non-keyword abilities), player1 will only have 1 card
                    // in hand and this assertion will fail. A failing assertion here indicates an engine limitation.
                    expect(context.player1.hand.length).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
