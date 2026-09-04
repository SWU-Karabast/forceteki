import { Trait } from '../../../../../server/game/core/Constants';

describe('The First Legion, Vader\'s Fist', function() {
    integration(function(contextRef) {
        describe('The First Legion\'s on attack ability', function() {
            it('should name a trait and make enemy cards, including those not in play, lose that trait for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['the-first-legion#vaders-fist'],
                    },
                    player2: {
                        leader: 'iden-versio#inferno-squad-commander',
                        hand: ['first-legion-snowtrooper'],
                        deck: ['death-trooper'],
                        discard: ['rebel-pathfinder'],
                        resources: ['echo-base-defender', 'wampa', 'wampa', 'wampa', 'wampa'],
                        groundArena: ['snowtrooper-lieutenant', 'scout-bike-pursuer'],
                    }
                });

                const { context } = contextRef;

                const enemyTrooperCards = [
                    context.snowtrooperLieutenant,
                    context.scoutBikePursuer,
                    context.idenVersio,
                    context.firstLegionSnowtrooper,
                    context.deathTrooper,
                    context.rebelPathfinder,
                    context.echoBaseDefender
                ];

                for (const card of enemyTrooperCards) {
                    expect(card.hasSomeTrait(Trait.Trooper)).toBeTrue();
                }

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDropdownListOptions(context.getTraitNames());
                context.player1.chooseListOption('Trooper');

                expect(context.getChatLogs(5)).toContain('player1 names Trooper using The First Legion');
                expect(context.getChatLogs(5)).toContain('player1 uses The First Legion to remove the Trooper trait from all cards controlled by player2 for this phase');
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();

                // all enemy cards lose the Trooper trait, including the leader and cards in hand, deck, discard and resources
                for (const card of enemyTrooperCards) {
                    expect(card.hasSomeTrait(Trait.Trooper)).toBeFalse();
                }

                // other traits are unaffected
                expect(context.snowtrooperLieutenant.hasSomeTrait(Trait.Imperial)).toBeTrue();
                expect(context.idenVersio.hasSomeTrait(Trait.Imperial)).toBeTrue();
                expect(context.rebelPathfinder.hasSomeTrait(Trait.Rebel)).toBeTrue();

                // friendly cards keep the trait
                expect(context.theFirstLegion.hasSomeTrait(Trait.Trooper)).toBeTrue();
                expect(context.battlefieldMarine.hasSomeTrait(Trait.Trooper)).toBeTrue();

                // a card the opponent plays later in the phase still lacks the trait
                context.player2.clickCard(context.firstLegionSnowtrooper);
                expect(context.firstLegionSnowtrooper).toBeInZone('groundArena');
                expect(context.firstLegionSnowtrooper.hasSomeTrait(Trait.Trooper)).toBeFalse();

                // the trait comes back at the end of the phase
                context.moveToNextActionPhase();

                for (const card of enemyTrooperCards) {
                    expect(card.hasSomeTrait(Trait.Trooper)).toBeTrue();
                }
            });

            it('should keep the named trait removed for the rest of the phase even if The First Legion is defeated during the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-first-legion#vaders-fist'],
                    },
                    player2: {
                        groundArena: ['general-veers#blizzard-force-commander', 'atst'],
                    }
                });

                const { context } = contextRef;

                // AT-ST gets +1/+1 from General Veers while it has the Imperial trait
                expect(context.atst.getPower()).toBe(7);
                expect(context.atst.getHp()).toBe(8);

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.atst);
                context.player1.chooseListOption('Imperial');

                // the trait is removed before combat damage, so the AT-ST loses the buff and deals 6 damage to The First Legion
                expect(context.atst.hasSomeTrait(Trait.Imperial)).toBeFalse();
                expect(context.generalVeers.hasSomeTrait(Trait.Imperial)).toBeFalse();
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.atst.damage).toBe(5);
                expect(context.theFirstLegion).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();

                // the effect lasts for the phase even though The First Legion has left play
                context.player2.passAction();
                expect(context.atst.hasSomeTrait(Trait.Imperial)).toBeFalse();
                expect(context.atst.getPower()).toBe(6);

                context.moveToNextActionPhase();
                expect(context.atst.hasSomeTrait(Trait.Imperial)).toBeTrue();
                expect(context.atst.getPower()).toBe(7);
            });

            it('should only affect cards controlled by the opponent, regardless of who owns them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        groundArena: ['the-first-legion#vaders-fist', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['scout-bike-pursuer'],
                    }
                });

                const { context } = contextRef;

                // player 1 takes control of Scout Bike Pursuer and player 2 takes control of Battlefield Marine
                context.player1.clickCard(context.player1.findCardByName('change-of-heart'));
                context.player1.clickCard(context.scoutBikePursuer);
                context.player2.clickCard(context.player2.findCardByName('change-of-heart'));
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.scoutBikePursuer).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);
                context.player1.chooseListOption('Trooper');

                // Battlefield Marine is owned by player 1 but is an enemy card while player 2 controls it
                expect(context.battlefieldMarine.hasSomeTrait(Trait.Trooper)).toBeFalse();

                // Scout Bike Pursuer is owned by player 2 but is a friendly card while player 1 controls it
                expect(context.scoutBikePursuer.hasSomeTrait(Trait.Trooper)).toBeTrue();
                expect(context.theFirstLegion.hasSomeTrait(Trait.Trooper)).toBeTrue();

                // control returns to the owners in the regroup phase and the effect ends
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.scoutBikePursuer).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine.hasSomeTrait(Trait.Trooper)).toBeTrue();
                expect(context.scoutBikePursuer.hasSomeTrait(Trait.Trooper)).toBeTrue();
            });

            it('should remove the trait from enemy cards in play, including a deployed leader, as counted by other abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-first-legion#vaders-fist'],
                    },
                    player2: {
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                        groundArena: [{ card: 'snowtrooper-lieutenant', upgrades: ['squad-support'] }, 'first-legion-snowtrooper'],
                    }
                });

                const { context } = contextRef;

                // Squad Support gives +1/+1 for each Trooper unit its controller has: both Snowtroopers and Iden
                expect(context.snowtrooperLieutenant.getPower()).toBe(5);
                expect(context.snowtrooperLieutenant.getHp()).toBe(5);

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);
                context.player1.chooseListOption('Trooper');

                // the deployed leader loses the trait as a unit as well, so Squad Support counts no Trooper units
                expect(context.idenVersio.hasSomeTrait(Trait.Trooper)).toBeFalse();
                expect(context.snowtrooperLieutenant.getPower()).toBe(2);
                expect(context.snowtrooperLieutenant.getHp()).toBe(2);

                context.moveToNextActionPhase();
                expect(context.idenVersio.hasSomeTrait(Trait.Trooper)).toBeTrue();
                expect(context.snowtrooperLieutenant.getPower()).toBe(5);
                expect(context.snowtrooperLieutenant.getHp()).toBe(5);
            });

            it('should remove the trait from enemy cards in hand, so they cannot be played by an ability that requires it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-first-legion#vaders-fist'],
                    },
                    player2: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        hand: ['nihil-marauder'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);
                context.player1.chooseListOption('Underworld');

                expect(context.nihilMarauder.hasSomeTrait(Trait.Underworld)).toBeFalse();

                // Jabba can no longer play the card in hand, since it is not an Underworld unit any more:
                // attacking is his only remaining option, so clicking him goes straight to attack targeting
                context.player2.clickCard(context.jabbaTheHutt);
                expect(context.player2).toHavePrompt('Choose a target for attack');
                context.player2.clickPrompt('Cancel');

                context.player2.passAction();
                context.moveToNextActionPhase();

                // once the phase ends the trait is back and Jabba can play it again
                expect(context.nihilMarauder.hasSomeTrait(Trait.Underworld)).toBeTrue();
                context.player1.passAction();
                context.player2.clickCard(context.jabbaTheHutt);
                expect(context.player2).toHaveExactPromptButtons([
                    'Play an Underworld unit unit from your hand',
                    'Attack',
                    'Cancel'
                ]);
                context.player2.clickPrompt('Cancel');
                context.player2.passAction();
            });

            it('should remove the trait from enemy cards in the deck and discard pile, whatever their card type', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-first-legion#vaders-fist'],
                    },
                    player2: {
                        hand: ['psychometry'],
                        discard: ['yoda#old-master'],
                        deck: ['qimir#everyone-has-a-weakness', 'heightened-awareness', 'force-choke', 'jedi-light-cruiser', 'wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);
                context.player1.chooseListOption('Force');

                // Psychometry searches the deck for a card sharing a trait with a card in the discard pile
                context.player2.clickCard(context.psychometry);
                context.player2.clickCard(context.yoda);

                // Yoda lost Force but kept Jedi, and the Force unit, upgrade and event in the deck no longer share a trait with him
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.jediLightCruiser],
                    invalid: [context.qimir, context.heightenedAwareness, context.forceChoke, context.wampa]
                });
                context.player2.clickPrompt('Take nothing');
            });

            it('should be able to name a base trait, which only the enemy base loses', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'bright-tree-village',
                        groundArena: ['the-first-legion#vaders-fist', 'village-troublemaker'],
                    },
                    player2: {
                        base: 'bright-tree-village',
                        groundArena: ['village-troublemaker'],
                    }
                });

                const { context } = contextRef;
                const friendlyTroublemaker = context.player1.findCardByName('village-troublemaker');
                const enemyTroublemaker = context.player2.findCardByName('village-troublemaker');

                context.player1.clickCard(context.theFirstLegion);
                context.player1.clickCard(context.p2Base);
                context.player1.chooseListOption('Endor');

                expect(context.p2Base.hasSomeTrait(Trait.Endor)).toBeFalse();
                expect(context.p1Base.hasSomeTrait(Trait.Endor)).toBeTrue();

                // Village Troublemaker only has Hidden and Saboteur while its controller has an Endor base
                expect(enemyTroublemaker.hasSomeKeyword('hidden')).toBeFalse();
                expect(enemyTroublemaker.hasSomeKeyword('saboteur')).toBeFalse();
                expect(friendlyTroublemaker.hasSomeKeyword('hidden')).toBeTrue();
                expect(friendlyTroublemaker.hasSomeKeyword('saboteur')).toBeTrue();

                context.moveToNextActionPhase();
                expect(context.p2Base.hasSomeTrait(Trait.Endor)).toBeTrue();
                expect(enemyTroublemaker.hasSomeKeyword('hidden')).toBeTrue();
                expect(enemyTroublemaker.hasSomeKeyword('saboteur')).toBeTrue();
            });
        });
    });
});
