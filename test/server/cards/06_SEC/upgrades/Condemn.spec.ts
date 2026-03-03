describe('Condemn', function () {
    integration(function (contextRef) {
        const disclosePrompt = (attackerTitle: string) => `Disclose Vigilance, Villainy to give ${attackerTitle} -6/-0 for this attack`;

        describe('The gained On Attack ability targeting attached unit', function () {
            it('should allow the defending player to disclose Vigilance & Villainy to give attached unit -6/-0 for the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'condemn',
                            'superlaser-blast'
                        ],
                        groundArena: ['awakened-specters']
                    },
                    player2: {
                        groundArena: ['ravenous-rathtar']
                    }
                });

                const { context } = contextRef;

                // Play Condemn on Ravenous Rathtar
                context.player1.clickCard(context.condemn);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.awakenedSpecters,
                    context.ravenousRathtar
                ]);
                context.player1.clickCard(context.ravenousRathtar);

                // P2 attacks Awakened Specters with Ravenous Rathtar
                context.player2.clickCard(context.ravenousRathtar);
                context.player2.clickCard(context.awakenedSpecters);

                // P1 is prompted to disclose Vigilance/Villainy
                expect(context.player1).toHavePrompt(disclosePrompt(context.ravenousRathtar.title));
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.superlaserBlast
                ]);

                // P1 discloses Superlaser Blast
                context.player1.clickCard(context.superlaserBlast);

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.superlaserBlast]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Attack resolves
                expect(context.awakenedSpecters.damage).toBe(2); // Ravenous Rathtar deals 2 damage due to -6 power
                expect(context.ravenousRathtar.damage).toBe(4);
            });

            it('is automatically skipped if the required aspects cannot be disclosed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'condemn',
                            'open-fire',
                            'i-am-your-father'
                        ],
                        groundArena: ['awakened-specters']
                    },
                    player2: {
                        groundArena: ['ravenous-rathtar']
                    }
                });

                const { context } = contextRef;

                // Play Condemn on Ravenous Rathtar
                context.player1.clickCard(context.condemn);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.awakenedSpecters,
                    context.ravenousRathtar
                ]);
                context.player1.clickCard(context.ravenousRathtar);

                // P2 attacks Awakened Specters with Ravenous Rathtar
                context.player2.clickCard(context.ravenousRathtar);
                context.player2.clickCard(context.awakenedSpecters);

                // P1 is not prompted to disclose Vigilance/Villainy
                expect(context.player1).not.toHavePrompt(disclosePrompt(context.ravenousRathtar.title));

                // Attack resolves, defeating Awakened Specters
                expect(context.awakenedSpecters).toBeInZone('discard', context.player1);
                expect(context.ravenousRathtar.damage).toBe(4);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('The blanking effect during the attack', function () {
            it('makes the attached unit lose constant abilities for the duration of the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'axe-woves#accomplished-warrior',
                            upgrades: [
                                'shield',
                                'condemn',
                                'experience'
                            ]
                        }]
                    }
                });

                const { context } = contextRef;

                // Sanity check Axe's power before attack
                expect(context.axeWoves.getPower()).toBe(6);

                // P1 attacks base with Axe Woves
                context.player1.clickCard(context.axeWoves);
                context.player1.clickCard(context.p2Base);

                // Axe only hits for 3 because his constant ability is removed for the attack
                expect(context.p2Base.damage).toBe(3);
            });

            it('turns off the shield defeat part of Saboteur, but not the target selection part', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'resourceful-pursuers',
                            upgrades: ['condemn']
                        }]
                    },
                    player2: {
                        groundArena: [
                            'niima-outpost-constables',
                            { card: 'battlefield-marine', upgrades: ['shield', 'shield'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Initiate an attack with Resourceful Pursuers
                context.player1.clickCard(context.resourcefulPursuers);

                // It can still target any ground unit or base because Saboteur's target selection is unaffected
                expect(context.player1).toBeAbleToSelectExactly([
                    context.niimaOutpostConstables,
                    context.battlefieldMarine,
                    context.p2Base
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                // It loses the ability to defeat all shields on attack
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine.damage).toBe(0);
            });

            it('makes the attached unit lose keyword abilities for the duration of the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'maul#a-rival-in-darkness', // Gives Overwhelm to friendly units
                            deployed: true
                        },
                        base: {
                            card: 'chopper-base',
                            damage: 5
                        },
                        hand: [
                            'grim-resolve' // Attack with a unit, it gains Grit for the attack
                        ],
                        groundArena: [{
                            card: 'nihil-marauder',
                            damage: 2,
                            upgrades: [
                                'condemn',
                                'devotion', // Restore 2 and +1/+1
                            ]
                        }]
                    },
                    player2: {
                        groundArena: ['ion-cannon', 'battle-droid']
                    }
                });

                const { context } = contextRef;

                // Play Grim Resolve to initiate an attack with Nihil Marauder
                context.player1.clickCard(context.grimResolve);
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickCard(context.ionCannon);

                // It loses Raid and does not gain Grit from Grim Resolve, so only deals 2 damage
                expect(context.ionCannon.damage).toBe(2);

                // It loses Restore from Devotion, so base is not healed
                expect(context.p1Base.damage).toBe(5);

                // Move to next action phase
                context.moveToNextActionPhase();

                // Nihil Marauder attacks Battle Droid
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickCard(context.battleDroid);

                // It does not have Overwhelm, so no damage goes to base
                expect(context.p2Base.damage).toBe(0);
            });

            it('makes the attached unit lose triggered abilities for the duration of the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'seventh-sister#implacable-inquisitor',
                            upgrades: [
                                'condemn',
                                'fallen-lightsaber'
                            ]
                        }]
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Seventh Sister
                context.player1.clickCard(context.seventhSister);
                context.player1.clickCard(context.p2Base);

                // Neither Fallen Lightsaber nor Seventh Sister's triggered ability trigger
                // Attack ends with no damage dealt to Consular Security Force
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('makes the attached unit lose When Defeated & Bounty abilities if it is defeated during the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'consular-security-force',
                            {
                                card: 'val#loyal-to-the-end',
                                upgrades: ['condemn']
                            }
                        ]
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });

                const { context } = contextRef;

                // P1 attacks Reinforcement Walker with Val
                context.player1.clickCard(context.val);
                context.player1.clickCard(context.reinforcementWalker);

                // Val is defeated and does not trigger her When Defeated or Bounty abilities
                expect(context.val).toBeInZone('discard', context.player1);
                expect(context.consularSecurityForce.upgrades.length).toBe(0); // No Experience given from When Defeated
                expect(context.consularSecurityForce.damage).toBe(0); // No damage from Bounty
                expect(context.reinforcementWalker.damage).toBe(2); // From combat
                expect(context.player2).toBeActivePlayer();
            });

            it('also blanks post-attack triggers', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['resupply'],
                        groundArena: [{
                            card: 'ezra-bridger#resourceful-troublemaker',
                            upgrades: ['condemn']
                        }]
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Ezra Bridger
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // No post-attack trigger, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('results in full blanking when multiple Condemn upgrades are attached', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'reinforcement-walker',
                            upgrades: ['condemn']
                        }]
                    },
                    player2: {
                        hand: ['condemn', 'superlaser-blast'],
                    }
                });

                const { context } = contextRef;
                const p2Condemn = context.player2.findCardByName('condemn');

                // P1 attacks base with Reinforcement Walker
                context.player1.clickCard(context.reinforcementWalker);
                context.player1.clickCard(context.p2Base);

                // P2 is prompted to disclose Vigilance/Villainy to give Reinforcement Walker -6/-0
                expect(context.player2).toHavePrompt(disclosePrompt(context.reinforcementWalker.title));
                expect(context.player2).toHaveChooseNothingButton();
                expect(context.player2).toBeAbleToSelectExactly([
                    p2Condemn,
                    context.superlaserBlast
                ]);

                // P2 reveals Condemn
                context.player2.clickCard(p2Condemn);

                // Cards are revealed to the opponent
                expect(context.player1).toHaveExactViewableDisplayPromptCards([p2Condemn]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Attack resolves
                expect(context.p2Base.damage).toBe(0); // Reinforcement Walker deals no damage due to -6 power
                context.player2.claimInitiative();
                context.moveToNextActionPhase();

                // P2 plays the second Condemn on Reinforcement Walker
                context.player2.clickCard(p2Condemn);
                context.player2.clickCard(context.reinforcementWalker);

                // P1 attacks base with Reinforcement Walker again
                context.player1.clickCard(context.reinforcementWalker);
                context.player1.clickCard(context.p2Base);

                // P2 is not prompted to disclose Vigilance/Villainy again since Reinforcement Walker is fully blanked
                expect(context.player2).not.toHavePrompt(disclosePrompt(context.reinforcementWalker.title));

                // Attack resolves with no debuff
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('results in full blanking when combined with Exiled From the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'luke-skywalker#jedi-knight',
                            damage: 4,
                            upgrades: ['condemn', 'exiled-from-the-force']
                        }]
                    },
                    player2: {
                        hand: ['superlaser-blast'],
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Luke Skywalker
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // P2 is not prompted to disclose Vigilance/Villainy since Luke is fully blanked
                expect(context.player2).not.toHavePrompt(disclosePrompt(context.lukeSkywalker.title));

                // Attack resolves with no Grit and no debuff
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not affect the attached unit when there is a separate full blanking effect being applied', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['superlaser-blast', 'there-is-no-escape'],
                    },
                    player2: {
                        groundArena: [{
                            card: 'reinforcement-walker',
                            upgrades: ['condemn']
                        }]
                    }
                });

                const { context } = contextRef;

                // P1 plays There Is No Escape on Reinforcement Walker to remove all its abilities
                context.player1.clickCard(context.thereIsNoEscape);
                context.player1.clickCard(context.reinforcementWalker);
                context.player1.clickPrompt('Done');

                // P2 attacks base with Reinforcement Walker
                context.player2.clickCard(context.reinforcementWalker);
                context.player2.clickCard(context.p1Base);

                // P1 is not prompted to disclose Vigilance/Villainy since Reinforcement Walker is fully blanked
                expect(context.player1).not.toHavePrompt(disclosePrompt(context.reinforcementWalker.title));

                // Attack resolves with no debuff
                expect(context.p1Base.damage).toBe(6);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});