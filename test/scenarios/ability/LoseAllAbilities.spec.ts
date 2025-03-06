// From Comprehensive Rules v4.0, 8.15.2:
//   If an ability causes a card to "lose all abilities," the card ceases to have any
//   abilities, including abilities given to it by other cards, for the duration of the
//   "lose" effect. The card cannot gain abilities for the duration of the effect.
describe('Lose All Abilities', function() {
    integration(function(contextRef) {
        describe('A unit that loses all abilities for a duration', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: [
                            'protector',
                            'vambrace-grappleshot',
                            'squad-support',
                            'strategic-acumen',
                            'swoop-racer',
                            'breaking-in',
                            'heroic-sacrifice',
                            'red-three#unstoppable',
                            'general-krell#heartless-tactician',
                            'entrenched',
                            'attack-pattern-delta',
                            'shadowed-intentions'
                        ],
                        groundArena: [
                            'academy-defense-walker',
                            'contracted-hunter',
                            'grogu#irresistible',
                            'liberated-slaves',
                            '97th-legion#keeping-the-peace-on-sullust',
                            'battlefield-marine'
                        ],
                        spaceArena: [
                            'strafing-gunship'
                        ]
                    },
                    player2: {
                        hand: [
                            'unshakeable-will',
                            'supreme-leader-snoke#shadow-ruler',
                            'satine-kryze#committed-to-peace',
                            'change-of-heart',
                            'takedown'
                        ],
                        groundArena: [
                            'consular-security-force'
                        ]
                    }
                });
            });

            // Printed abilities

            it('loses printed keyword abilities until the effect expires', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);
                context.player1.passAction();

                // Academy Defense Walker no longer has Sentinel
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);

                // Effect expires
                context.moveToNextActionPhase();
                context.player1.passAction();

                // Academy Defense Walker has Sentinel back
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeAbleToSelectExactly([context.academyDefenseWalker]);
                context.player2.clickCard(context.academyDefenseWalker);
            });

            it('loses printed triggered abilities until the effect expires', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Contracted Hunter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.contractedHunter);

                context.moveToNextActionPhase();

                // Contracted Hunter is still in play because his triggered ability was removed
                expect(context.contractedHunter).toBeInZone('groundArena');

                // Effect expires
                context.moveToNextActionPhase();

                // Contracted Hunter is defeated because his triggered ability is back
                expect(context.contractedHunter).toBeInZone('discard');
            });

            it('loses printed constant abilities until the effect expires', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Strafing Gunship
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.strafingGunship);

                // Attack with Strafing Gunship, it can only attack the base
                context.player1.clickCard(context.strafingGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Effect expires
                context.moveToNextActionPhase();

                // Strafing Gunship can attack ground units again
                context.player1.clickCard(context.strafingGunship);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.p2Base,
                    context.consularSecurityForce
                ]);
                context.player1.clickCard(context.consularSecurityForce);
            });

            it('loses printed action abilities until the effect expires', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Grogu
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.grogu);

                // Grogu no longer has an action ability
                context.player1.clickCard(context.grogu);

                expect(context.player1).not.toHaveEnabledPromptButton('Exhaust an enemy unit');
                expect(context.player1).toBeAbleToSelect(context.consularSecurityForce);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.exhausted).toBeFalse();

                // Effect expires
                context.moveToNextActionPhase();

                // Grogu has his action ability back
                context.player1.clickCard(context.grogu);
                expect(context.player1).toHaveEnabledPromptButton('Exhaust an enemy unit');
                context.player1.clickPrompt('Exhaust an enemy unit');
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.exhausted).toBeTrue();
            });

            it('is immediately defeated if it has 0 HP', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on 97th Legion
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context._97thLegion);
                context.player1.passAction();

                // 97th Legion is defeated because it has no remaining HP
                expect(context._97thLegion).toBeInZone('discard');
            });

            // Abilities gained from upgrades

            it('cannot gain new keyword abilities from upgrades while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);

                // Play Protector on Academy Defense Walker to attempt to give it Sentinel again
                context.player1.clickCard(context.protector);
                context.player1.clickCard(context.academyDefenseWalker);

                // Academy Defense Walker does not have Sentinel
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);
            });

            it('cannot gain new triggered abilities from upgrades while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Grogu
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.grogu);

                // Play Vambrace Grappleshot on Grogu to attempt to give it a triggered ability
                context.player1.clickCard(context.vambraceGrappleshot);
                context.player1.clickCard(context.grogu);

                context.player2.passAction();

                // Academy Defense Walker does not have the On Attack ability
                context.player1.clickCard(context.grogu);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.exhausted).toBeFalse();
            });

            it('cannot gain new constant abilities from upgrades while the effect is active', function() {
                const { context } = contextRef;

                // Deploy Kazuda
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono');
                context.player2.passAction();

                // Attach Shadowed Intentions to Contracted Hunter to give it a constant ability
                context.player1.clickCard(context.shadowedIntentions);
                context.player1.clickCard(context.contractedHunter);
                context.player2.passAction();

                // Attack with Kazuda to remove Grogu and Contracted Hunter's abilities
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.grogu);
                context.player1.clickCard(context.contractedHunter);
                context.player1.clickPrompt('Done');

                // Player 2 plays Takedown to defeat Contracted Hunter because he is not protected by Shadowed Intentions
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.contractedHunter);

                expect(context.contractedHunter).toBeInZone('discard');

                // Play Squad Support on Grogu to attempt to give it a constant ability
                context.player1.clickCard(context.squadSupport);
                context.player1.clickCard(context.grogu);

                // Grogu does not have a power or HP boost
                expect(context.grogu.getPower()).toBe(0);
                expect(context.grogu.getHp()).toBe(5);

                // Effect expires
                context.moveToNextActionPhase();

                // Grogu has his power and HP boost
                expect(context.grogu.getPower()).toBe(2);
                expect(context.grogu.getHp()).toBe(7);
            });

            it('cannot gain new action abilities from upgrades while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);

                // Play Strategic Acumen on Academy Defense Walker to attempt to give it an action ability
                context.player1.clickCard(context.strategicAcumen);
                context.player1.clickCard(context.academyDefenseWalker);

                context.player2.passAction();

                // Academy Defense Walker does not have an action ability
                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.player1).not.toHaveEnabledPromptButton('Play a unit from your hand. It costs 1 less');
                expect(context.player1).toBeAbleToSelect(context.p2Base);
                context.player1.clickCard(context.p2Base);

                // Effect expires
                context.moveToNextActionPhase();

                // Academy Defense Walker has its gained action ability
                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.player1).toHaveEnabledPromptButton('Play a unit from your hand. It costs 1 less');
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
                expect(context.player1).toBeAbleToSelect(context.swoopRacer);
                context.player1.clickCard(context.swoopRacer);

                expect(context.academyDefenseWalker.exhausted).toBeTrue();
                expect(context.swoopRacer).toBeInZone('groundArena');
            });

            // Abilities gained from events

            it('cannot gain new keyword abilities from events while the effect is active', function() {
                const { context } = contextRef;

                // Player 2 gives Consular Security Force Sentinel
                context.player1.passAction();
                context.player2.clickCard(context.unshakeableWill);
                context.player2.clickCard(context.consularSecurityForce);

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);

                // Play Breaking In to attempt to give Academy Defense Walker Saboteur
                context.player1.clickCard(context.breakingIn);
                context.player1.clickCard(context.academyDefenseWalker);

                // Academy Defense Walker cannot attack the base because it does not have Saboteur
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);

                context.player1.clickCard(context.consularSecurityForce);

                // Defender has 7 damage because Academy Defense Walker still got the attack buff
                expect(context.consularSecurityForce.damage).toBe(7);
            });

            it('cannot gain new triggered abilities from events while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Liberated Slaves
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.liberatedSlaves);

                // Play Heroic Sacrifice to attempt to give Liberated Slaves a triggered ability
                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.consularSecurityForce);

                // Liberated Slaves is not defeated because it does not have the triggered ability from Heroic Sacrifce
                expect(context.liberatedSlaves).toBeInZone('groundArena');

                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.liberatedSlaves.damage).toBe(3);
            });

            // TODO: There are not currently any events that give units constant or action abilities

            // Abilities gained from other units

            it('cannot gain new keyword abilities from other units while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Liberated Slaves
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.liberatedSlaves);

                // Play Red Three to give all hearoism units Raid 1
                context.player1.clickCard(context.redThree);

                context.player2.passAction();

                // Liberated Slaves still attacks for 3 because it does not have Raid 1
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(3);

                // Effect expires
                context.moveToNextActionPhase();
                context.consularSecurityForce.damage = 0;

                // Liberated Slaves now has Raid 1
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.consularSecurityForce);

                // Damage total is exactly 7, defeating Consular Security Force
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('cannot gain new triggered abilities from other units while the effect is active', function() {
                const { context } = contextRef;

                // Remove ground sentinel for test case
                context.player1.moveCard(context.academyDefenseWalker, 'hand');

                // Use Kazuda's ability on Battlefield Marine
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.battlefieldMarine);

                // Play General Krell to give all other friendly units a triggered ability
                context.player1.clickCard(context.generalKrell);

                const cardsInHandBefore = context.player1.hand.length;

                // Consular Security Force attacks and defeats Battlefield Marine
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Player 1 did not draw a card because Battlefield Marine did not have the triggered ability from General Krell
                expect(context.player1.hand.length).toBe(cardsInHandBefore);
            });

            it('cannot gain new action abilities from other units while the effect is active', function() {
                const { context } = contextRef;
                const satinePromptText = 'Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up';

                // Use Kazuda's ability on Liberated Slaves
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.passAction();

                // Player 2 plays Satine Kryze, giving all units in play an action ability
                context.player2.clickCard(context.satineKryze);

                // Liberated Slaves does not have the action ability from Satine Kryze
                context.player1.clickCard(context.liberatedSlaves);
                expect(context.player1).not.toHaveEnabledPromptButton(satinePromptText);
                context.player1.clickCard(context.consularSecurityForce);

                // Effect expires
                context.moveToNextActionPhase();

                // Liberated Slaves has the action ability gained from Satine Kryze
                context.player1.clickCard(context.liberatedSlaves);
                expect(context.player1).toHaveEnabledPromptButton(satinePromptText);
                context.player1.clickPrompt(satinePromptText);
                expect(context.liberatedSlaves.exhausted).toBeTrue();
            });

            // TODO: There are not currently any units that give other units constant abilities

            // Other effects are not blanked

            it('can still be affected by ongoing effects from other units', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);
                context.player1.passAction();

                // Player 2 plays Supreme Leader Snoke, giving all enemy units -2/-2
                context.player2.clickCard(context.supremeLeaderSnoke);

                // Academy Defense Walker is affected by Snoke's effect
                expect(context.academyDefenseWalker.getPower()).toBe(3);
                expect(context.academyDefenseWalker.getHp()).toBe(3);
            });

            it('can still be affected by ongoing effects from upgrades', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);

                // Play Entrenched on Academy Defense Walker
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.academyDefenseWalker);

                context.player2.passAction();

                // Academy Defense Walker cannot attack bases because of the Entrenched upgrades's ability
                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                expect(context.academyDefenseWalker.getPower()).toBe(8);
                expect(context.academyDefenseWalker.getHp()).toBe(8);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toBeInZone('discard');
            });

            it('can still be affected by ongoing effects from events', function() {
                const { context } = contextRef;

                // Play Attack Pattern Delta to buff 3 friendly units
                context.player1.clickCard(context.attackPatternDelta);
                context.player1.clickCard(context.academyDefenseWalker);
                context.player1.clickCard(context._97thLegion);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // Use Kazuda's ability on 97th Legion
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context._97thLegion);

                // 97th Legion is still in play because it has +2/+2 from Attack Pattern Delta
                expect(context._97thLegion.getPower()).toBe(2);
                expect(context._97thLegion.getHp()).toBe(2);

                context.player1.clickCard(context._97thLegion);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                context.moveToNextActionPhase();

                // 97th Legion is defeated because APD's effect expires before the blanking effect
                expect(context._97thLegion).toBeInZone('discard');
            });

            it('still has no abilities if it changes control', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Academy Defense Walker
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.academyDefenseWalker);
                context.player1.passAction();

                // Player 2 plays Change of Heart to take control of Academy Defense Walker
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.academyDefenseWalker);

                // Player 1 can attack any target because Academy Defense Walker is not a Sentinel
                context.player1.clickCard(context._97thLegion);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.p2Base,
                    context.consularSecurityForce,
                    context.academyDefenseWalker
                ]);
                context.player1.clickCard(context.consularSecurityForce);
            });
        });

        describe('Some meta-relavant and edge cases worth covering:', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        hand: [
                            'sneak-attack',
                            'ruthless-raider',
                            'trench-run',
                            'traitorous'
                        ],
                        groundArena: [
                            // 'academy-defense-walker',
                            // 'contracted-hunter',
                            // 'grogu#irresistible',
                            // 'liberated-slaves',
                            // '97th-legion#keeping-the-peace-on-sullust',
                            // 'battlefield-marine'
                        ],
                        spaceArena: [
                            'millennium-falcon#piece-of-junk',
                            'fireball#an-explosion-with-wings'
                        ]
                    },
                    player2: {
                        hand: [
                            'takedown'
                        ],
                        groundArena: [
                            'consular-security-force',
                            'val#loyal-to-the-end'
                        ],
                        deck: [
                            'devastator#inescapable',
                            'ma-klounkee'
                        ]
                    }
                });
            });

            it('SOR Millennium Falcon\'s tax can be avoided by removing its ability for the round', function() {
                const { context } = contextRef;

                // Attack with Kazuda to activate ability
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.p2Base);

                // Choose Millennium Falcon to remove its ability
                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickPrompt('Done');

                // Move to next action phase
                context.moveToNextActionPhase();

                // Falcon tax was not paid
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // Effect has expired, move to next phase
                context.moveToRegroupPhase();

                // Resource
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Falcon tax is back
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('if Ruthless Raider\'s abilities are removed for the round, its when-defeated will not trigger if it dies during the regroup phase', function() {
                const { context } = contextRef;

                // Sneak Attack Ruthless Raider
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.p2Base.damage).toBe(2);

                context.player2.passAction();

                // Attack with Kazuda to remove Ruthless Raider's abilities (and others to suppress prompts)
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Done');

                // Move to the regroup phase
                context.moveToRegroupPhase();

                // Ruthless Raider is defeated and Player 2's base took no more damage
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
            });

            it('can remove negative effects of events like Trench Run', function() {
                const { context } = contextRef;

                // Attack with Kazuda to remove Fireball's ability
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Done');

                context.player2.passAction();

                // Play Trench Run on Fireball
                context.player1.clickCard(context.trenchRun);
                context.player1.clickCard(context.fireball);
                context.player1.clickCard(context.p2Base);

                // Fireball attacked with the buff (3 + 4), but cards were not discarded and it took no damage
                expect(context.p2Base.damage).toBe(7);
                expect(context.fireball.damage).toBe(0);

                expect(context.devastator).toBeInZone('deck');
                expect(context.maKlounkee).toBeInZone('deck');
            });

            it('can remove a bounty from a stolen unit', function() {
                const { context } = contextRef;

                // Play traitorous to steal Val
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.val);
                context.player2.passAction();

                // Attack with Kazuda to remove Val's abilities
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.val);
                context.player1.clickPrompt('Done');

                // Player 2 defeats Val with takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.val);

                // No abilities to resolve
                expect(context.player2).not.toHaveExactPromptButtons(['You', 'Opponent']);

                context.moveToRegroupPhase();
            });
        });
    });
});