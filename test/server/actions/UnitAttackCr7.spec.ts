describe('Basic attack (CR7 update)', function() {
    integration(function(contextRef) {
        describe('When a unit attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        base: 'kestro-city'
                    },
                    attackRulesVersion: 'cr7',
                    player2: {
                        groundArena: ['frontier-atrt', 'enfys-nest#marauder'],
                        spaceArena: ['alliance-xwing'],
                        base: 'jabbas-palace'
                    }
                });
            });

            it('the player should only be able to select opponent\'s units in the same arena and base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                // can target opponent's ground units and base but not space units
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.enfysNest, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('the player should be able to cancel the attack and then trigger it again', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickPrompt('Cancel');
                expect(context.player1).toBeActivePlayer();
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');

                // can target opponent's ground units and base but not space units
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.enfysNest, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('from space arena to another unit in the space arena, attack should resolve correctly', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.allianceXwing);

                // attack against base should immediately resolve without prompt for a target, since only one is available
                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.cartelSpacer.exhausted).toBe(true);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.exhausted).toBe(false);

                expect(context.getChatLogs(2)).toContain('player1 attacks Alliance X-Wing with Cartel Spacer');
            });

            it('another unit and neither is defeated, both should receive damage and attacker should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.frontierAtrt);

                expect(context.wampa.damage).toBe(3);
                expect(context.frontierAtrt.damage).toBe(4);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.frontierAtrt.exhausted).toBe(false);
            });

            it('another unit and both are defeated, both should be in discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.enfysNest);

                expect(context.wampa).toBeInZone('discard');
                expect(context.enfysNest).toBeInZone('discard');
            });

            it('another unit and both are defeated, both should be in discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.enfysNest);

                expect(context.wampa).toBeInZone('discard');
                expect(context.enfysNest).toBeInZone('discard');
            });

            it('base with non-lethal damage, base should be damaged and attacker should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.wampa.damage).toBe(0);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(4);
            });

            it('base with lethal damage, game should end immediately', function () {
                const { context } = contextRef;

                context.setDamage(context.p2Base, 28);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                // we still expect this since it should've been done before the attack
                expect(context.wampa.exhausted).toBe(true);

                expect(context.p2Base.damage).toBe(30);
                expect(context.player1).toHavePrompt('player1 has won the game!');
                expect(context.player2).toHavePrompt('player1 has won the game!');
                expect(context.player1).toBeActivePlayer();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });

        it('When a unit attacks as part of an ability, it should not have a cancel button', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['fleet-lieutenant'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fleetLieutenant);
            expect(context.fleetLieutenant).toBeInZone('groundArena');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            expect(context.player1).not.toHaveEnabledPromptButton('Cancel');

            context.player1.clickCard(context.p2Base);
            expect(context.wampa.exhausted).toBe(true);
            expect(context.wampa.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);
        });

        it('When the defender changes controller during the attack, the attack should halt', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['sneak-attack', 'daring-raid', 'specforce-soldier'],
                    groundArena: ['poe-dameron#quick-to-improvise', 'battlefield-marine'],
                },
                player2: {
                    hand: ['traitorous'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.poeDameron);
            context.player1.clickCard(context.battlefieldMarine);

            // Discard selection for Poe ability
            context.player1.clickCard(context.sneakAttack);
            context.player1.clickDone();

            context.player1.clickPrompt('Defeat an upgrade.');
            context.player1.clickCard(context.traitorous);

            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.poeDameron.damage).toBe(0);
        });

        it('when the defender leaves and re-enters play during the attack (before combat damage), the attacker should not take damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['boba-fett#disintegrator']
                },
                player2: {
                    groundArena: [
                        {
                            card: 'poe-dameron#quick-to-improvise',
                            damage: 3,
                            exhausted: true,
                            upgrades: ['unrefusable-offer']
                        }
                    ]
                }
            });

            const { context } = contextRef;

            // Boba Fett attacks Poe, defeating him with the on-attack ability
            context.player1.clickCard(context.bobaFett);
            context.player1.clickCard(context.poeDameron);
            expect(context.poeDameron).toBeInZone('discard', context.player2);
            expect(context.bobaFett).toBeInZone('groundArena', context.player1);

            // Unrefusable Offer triggers, returning Poe to play under player1's control
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            // Poe is back in play with no damage
            expect(context.poeDameron).toBeInZone('groundArena', context.player1);
            expect(context.poeDameron.damage).toBe(0);

            // Boba Fett is still in play and has taken no damage
            expect(context.bobaFett).toBeInZone('groundArena', context.player1);
            expect(context.bobaFett.damage).toBe(0);
        });

        it('When evaluating attack targets for a card that grants an attacker effect, should not consider captured cards (and should not throw an exception)', async function() {
            await contextRef.setupTestAsync({
                attackRulesVersion: 'cr7',
                phase: 'action',
                player1: {
                    hand: ['breaking-in'],
                    groundArena: ['battlefield-marine', { card: 'atst', capturedUnits: ['wild-rancor'] }],
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['wampa'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.atst);

            context.player1.clickCard(context.breakingIn);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
        });

        it('"When this unit completes an attack" abilities should resolve even if the attacker was defeated by combat damage during the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['zeb-orrelios#headstrong-warrior']
                },
                player2: {
                    groundArena: ['rampaging-wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zebOrrelios);
            context.player1.clickCard(context.rampagingWampa);

            // Zeb Orrelios should deal 4 damage to another ground unit when he completes an attack and defeats the defender,
            // even if he was defeated in the process
            expect(context.rampagingWampa).toBeInZone('discard');
            expect(context.zebOrrelios).toBeInZone('discard');

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('"When this unit completes an attack" abilities should resolve in the same window as "when defeated" abilities', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['zeb-orrelios#headstrong-warrior', 'general-krell#heartless-tactician']
                },
                player2: {
                    groundArena: ['rampaging-wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zebOrrelios);
            context.player1.clickCard(context.rampagingWampa);

            // Zeb and Wampa trade, both of his abilities should trigger
            expect(context.rampagingWampa).toBeInZone('discard');
            expect(context.zebOrrelios).toBeInZone('discard');
            expect(context.player1).toHaveExactPromptButtons([
                'Draw a card',
                'If the defender was defeated, you may deal 4 damage to a ground unit'
            ]);

            context.player1.clickPrompt('Draw a card');
            context.player1.clickPrompt('Trigger');
            expect(context.player1.handSize).toBe(1);

            // Zeb ability resolves
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.generalKrell]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('"When combat damage is dealt" abilities should resolve in the same window as "when defeated" abilities"', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['warzone-lieutenant', 'general-krell#heartless-tactician']
                },
                player2: {
                    groundArena: ['phaseiii-dark-trooper'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.warzoneLieutenant);
            context.player1.clickCard(context.phaseiiiDarkTrooper);

            // Warzone Lieutenant is defeated, triggering his "when defeated" ability and Dark Trooper's "when combat damage is dealt" ability
            expect(context.warzoneLieutenant).toBeInZone('discard');
            expect(context.phaseiiiDarkTrooper.damage).toBe(2);

            expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
            context.player1.clickPrompt('You');

            // resolve Krell draw first
            context.player1.clickPrompt('Trigger');
            expect(context.player1.handSize).toBe(1);

            // Dark Trooper xp ability resolves automatically

            expect(context.phaseiiiDarkTrooper).toHaveExactUpgradeNames(['experience']);
            expect(context.phaseiiiDarkTrooper.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        describe('Gained "when combat damage is dealt" abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['heroic-sacrifice', 'general-krell#heartless-tactician'],
                        groundArena: ['atst', 'rukh#thrawns-assassin'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'nightsister-warrior'],
                    }
                });
            });

            it('should resolve correctly', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.atst).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve in the same window as "when defeated" abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.nightsisterWarrior);

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');

                // abilities resolve automatically

                expect(context.atst).toBeInZone('discard');
                expect(context.nightsisterWarrior).toBeInZone('discard');
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Gained "when combat damage is dealt" abilities should resolve in the same window as "when defeated" abilities and correctly nest triggers', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['heroic-sacrifice'],
                    groundArena: ['rukh#thrawns-assassin', { card: 'general-krell#heartless-tactician', upgrades: ['academy-training'] }],
                },
                player2: {
                    groundArena: ['tarfful#kashyyyk-chieftain', 'gentle-giant'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicSacrifice);
            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.gentleGiant);

            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.player1).toHaveExactPromptButtons([
                'Defeat unit being attacked',
                'When this unit deals combat damage: Defeat it.'
            ]);

            // resolve Heroic Sacrifice trigger first. Rukh is defeated, and the Krell trigger happens in a nested way.
            // therefore, it has to happen before the Rukh trigger
            context.player1.clickPrompt('When this unit deals combat damage: Defeat it.');

            // trigger card draw from Krell, confirm that Rukh trigger hasn't happened yet
            expect(context.gentleGiant).toBeInZone('groundArena');
            context.player1.clickPrompt('Trigger');

            // Rukh trigger resolves automatically, move to Tarfful trigger
            context.player2.clickCard(context.generalKrell);

            expect(context.rukh).toBeInZone('discard');
            expect(context.gentleGiant).toBeInZone('discard');
            expect(context.player1.handSize).toBe(2);       // draw from Krell and Heroic Sacrifice
            expect(context.generalKrell.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        const disclosePrompt = (attackerTitle) => `Disclose Vigilance, Villainy to give ${attackerTitle} -6/-0 for this attack`;

        it('Gained "while this unit is attacking" abilities should work', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
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

        it('Condemn correctly makes the attached unit lose When Defeated & Bounty abilities if it is defeated during the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
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

        it('Condemn blanks post-attack triggers', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
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
    });
});
