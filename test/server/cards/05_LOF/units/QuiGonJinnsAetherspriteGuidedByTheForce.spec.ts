/*
    ********************************************************************
                                TEST CASES
    ********************************************************************
    Qui-Gon Jinn's Aethersprite, Guided by the Force

    [On Attack]: The next time you use a "When Played" ability this phase,
      you may use that ability again.
    *********************************************************************

    Basic Functionality:
        - After the Aethersprite attacks, the next card played with a "When
          Played" ability can be triggered again.
        - The second card played with a "When Played" ability cannot be
          triggered again.
        - The ability is optional, so the player can choose not to trigger it
          again.
        - If the Aethersprite is able to attack twice, the next "When Played"
          ability can be re-triggered twice.
        - If the Aethersprite is able to attack again after the next "When
          Played" ability is triggered, the following "When Played" ability can be
          triggered again.
        - The ability expires at the end of the phase.
        - The ability does not expire if the Aethersprite leaves play.
        - Does not trigger for when-played-like abilities (e.g. Ambush & Shielded)

    Various types of "When Played" abilities to verify:
        - Using Smuggle:
            Privateer Crew | When played using Smuggle: Give 3 Experience tokens to this unit.
        - Coordinate (Ability activates when player controls 3 or more units):
            Pelta Supply Frigate | Coordinate - When Played: Create a Clone Trooper Token.
        - Play type (unit):
            Poe Dameron, One Hell of a Pilot | When played as a unit: Create an X-Wing token.
            You may attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it.
        - Play type (upgrade):
            Snap Wexley, Resistance Recon Flier | When played as an upgrade: Search the top 5
            cards of your deck for a Resistance card, reveal it, and draw it.
        - Combined ability:
            Reinforcement Walker | When Played/On Attack: Look at the top card of your deck. Either
            draw that card or discard it and heal 3 damage from your base.
        - Multiple "When Played" abilities:
            Anakin Skywalker, Champion of Mortis | When Played: If there is a [Heroism] card in your
            discard pile, you may give a unit -3/-3 for this phase. | When Played: If there is a
            [Villainy] card in your discard pile, you may give a unit -3/-3 for this phase.

    Unique "When Played" abilities to verify:
        - Regional Governor | When Played: Name a card. While this unit is in play, opponents can't
           play the named card.
        - Huyang, Enduring Instructor | When Played: Choose another friendly unit. While this unit is
           in play, the chosen unit gets +2/+2.
        - Fenn Rau, Protector of Concord Dawn | When Played: You may play an upgrade from your hand.
           It costs [2 Resources] less.
        - Osi Sobeck, Warden of the Citadel | When Played: This unit captures an enemy non-leader ground
           unit with cost equal to or less than the number of resources paid to play this unit.
        - Count Dooku, Fallen Jedi | When Played: For each unit you exploited while playing this card,
           you may deal damage to an enemy unit equal to the power of the exploited unit.
        - Blue Leader, Scarif Air Support | When Played: You may pay [2 Resources]. If you do, move this
           unit to the ground arena and give 2 Experience tokens to it. (It's a ground unit.)
    *********************************************************************
*/

describe('Qui-Gon Jinn\'s Aethersprite, Guided by the Force', () => {
    integration(function (contextRef) {
        const prompt = 'Use that "When Played" ability again';

        describe('On Attack ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        base: 'echo-base',
                        hand: [
                            'leia-organa#defiant-princess', // When Played: Ready a resource or exhaust a unit.
                            'wing-leader', // When Played: Give 2 Experience tokens to another friendly Rebel unit.
                            'dogfight', // Attack with a unit, even if it's exhausted. That unit can't attack bases for this attack.
                            'crafty-smuggler', // Shielded
                            'auzituck-liberator-gunship' // Ambush
                        ],
                        spaceArena: [
                            'quigon-jinns-aethersprite#guided-by-the-force'
                        ],
                    },
                    player2: {
                        hand: [
                            'vanquish'
                        ],
                        spaceArena: [
                            'green-squadron-awing',
                            'phoenix-squadron-awing'
                        ]
                    }
                });
            });

            it('the next time you use a "When Played" ability this phase, it allows you to use that ability again', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Leia Organa's ability can be used again
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // Play Wing Leader to trigger its "When Played" ability
                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toHavePrompt('Give 2 Experience tokens to another friendly Rebel unit');
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
                context.player1.clickCard(context.leiaOrgana);

                // Verify that the ability cannot be used again
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.leiaOrgana).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('the next time you use a "When Played" ability this phase, you may choose not to use the ability again', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Pass');

                // Leia Organa's ability cannot be used again
                expect(context.player1).not.toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Play Wing Leader to trigger its "When Played" ability
                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toHavePrompt('Give 2 Experience tokens to another friendly Rebel unit');
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
                context.player1.clickCard(context.leiaOrgana);

                // Passing on Leia's ability consumes the Aethersprite's effect, so Wing Leader's ability cannot be used again
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.leiaOrgana).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be double-triggered by a "When Played" ability if the Aethersprite has attacked twice', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Dogfight to attack with the Aethersprite again
                context.player1.clickCard(context.dogfight);
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.greenSquadronAwing);

                context.player2.passAction();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(2); // Dogfight costs 1 resource

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Leia Organa's ability can be used again
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Aethersprite's ability is triggered again
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Leia Organa's ability can be used again
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Exhaust a unit');
                context.player1.clickCard(context.phoenixSquadronAwing);

                expect(context.phoenixSquadronAwing.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used on two different "When Played" abilities if the Aethersprite attacks again in between them', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Leia Organa's ability can be used again
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // Use Dogfight to attack with the Aethersprite again
                context.player1.clickCard(context.dogfight);
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.greenSquadronAwing);

                context.player2.passAction();

                // Play Wing Leader to trigger its "When Played" ability
                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toHavePrompt('Give 2 Experience tokens to another friendly Rebel unit');
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana).toHaveExactUpgradeNames(['experience', 'experience']);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Wing Leader's ability can be used again
                expect(context.player1).toHavePrompt('Give 2 Experience tokens to another friendly Rebel unit');
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('expires after the phase ends', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                // End the phase
                context.moveToNextActionPhase();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not expire if the Aethersprite leaves play', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                // Player 2 plays Vanquish to defeat the Aethersprite
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.quigonJinnsAethersprite);

                expect(context.quigonJinnsAethersprite).toBeInZone('discard');

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Leia Organa's ability can be used again
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger for Shielded or Ambush', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Crafty Smuggler to trigger its Shielded ability
                context.player1.clickCard(context.craftySmuggler);

                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.craftySmuggler).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Play the Gunship to trigger its Ambush ability
                context.player1.clickCard(context.auzituckLiberatorGunship);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Interaction with various types of "When Played" abilities:', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        base: { card: 'echo-base', damage: 3 },
                        hand: [
                            'pelta-supply-frigate', // Coordinate - When Played: Create a Clone Trooper Token.
                            'poe-dameron#one-hell-of-a-pilot', // When played as a unit: Create an X-Wing token. You may attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it.
                            'snap-wexley#resistance-recon-flier', // When played as an upgrade: Search the top 5 cards of your deck for a Resistance card, reveal it, and draw it.
                            'reinforcement-walker', // When Played/On Attack: Look at the top card of your deck. Either draw that card or discard it and heal 3 damage from your base.
                            'anakin-skywalker#champion-of-mortis', // When Played: If there is a [Heroism] card in your discard pile, you may give a unit -3/-3 for this phase. | When Played: If there is a [Villainy] card in your discard pile, you may give a unit -3/-3 for this phase.
                        ],
                        spaceArena: [
                            'quigon-jinns-aethersprite#guided-by-the-force',
                            'alliance-xwing'
                        ],
                        resources: [
                            'privateer-crew', // When played using Smuggle: Give 3 Experience tokens to this unit.
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst'
                        ],
                        discard: [
                            'echo-base-defender',
                            'death-star-stormtrooper',
                        ],
                        deck: [
                            'dilapidated-ski-speeder',
                            'resistance-blue-squadron',
                            'underworld-thug',
                            'underworld-thug',
                            'underworld-thug'
                        ]
                    },
                    player2: {
                        spaceArena: [
                            'green-squadron-awing',
                            'phoenix-squadron-awing'
                        ],
                        groundArena: [
                            'battlefield-marine',
                        ],
                    }
                });
            });

            it('should work with "When Played using Smuggle" abilities', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Privateer Crew to trigger its "When Played using Smuggle" ability
                context.player1.clickCard(context.privateerCrew);
                expect(context.privateerCrew).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Privateer Crew's ability resolves again
                expect(context.privateerCrew).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience', 'experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with "Coordinate - When Played" abilities', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Pelta Supply Frigate to trigger its "Coordinate - When Played" ability
                context.player1.clickCard(context.peltaSupplyFrigate);

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(1);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Pelta Supply Frigate's ability resolves again
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with "When Played as a unit" abilities', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Poe Dameron to trigger its "When Played as a unit" ability
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron');
                expect(context.player1).toHavePrompt('Attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.allianceXwing);

                expect(context.player1.findCardsByName('xwing').length).toBe(1);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot']);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Poe Dameron's ability resolves again
                expect(context.player1).toHavePrompt('Attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.quigonJinnsAethersprite);
                expect(context.player1.findCardsByName('xwing').length).toBe(2);
                expect(context.allianceXwing.upgrades.length).toBe(0);
                expect(context.quigonJinnsAethersprite).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should work with "When Played as an upgrade" abilities', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Snap Wexley with Piloting to trigger its "When Played as an upgrade" ability
                context.player1.clickCard(context.snapWexley);
                context.player1.clickPrompt('Play Snap Wexley with Piloting');
                context.player1.clickCard(context.allianceXwing);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.dilapidatedSkiSpeeder, context.resistanceBlueSquadron],
                    invalid: context.player1.findCardsByName('underworld-thug', 'deck').slice(0, 3)
                });
                context.player1.clickCardInDisplayCardPrompt(context.dilapidatedSkiSpeeder);

                expect(context.dilapidatedSkiSpeeder).toBeInZone('hand');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Snap Wexley's ability resolves again
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.resistanceBlueSquadron],
                    invalid: context.player1.findCardsByName('underworld-thug', 'deck').slice(0, 3)
                });
                context.player1.clickCardInDisplayCardPrompt(context.resistanceBlueSquadron);

                expect(context.resistanceBlueSquadron).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with "When Played/On Attack" abilities', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Reinforcement Walker to trigger its "When Played/On Attack" ability
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.dilapidatedSkiSpeeder]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                context.player1.clickDisplayCardPromptButton(context.dilapidatedSkiSpeeder.uuid, 'draw');

                expect(context.dilapidatedSkiSpeeder).toBeInZone('hand');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Reinforcement Walker's ability resolves again
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.resistanceBlueSquadron]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                context.player1.clickDisplayCardPromptButton(context.resistanceBlueSquadron.uuid, 'discard');

                expect(context.resistanceBlueSquadron).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with multiple "When Played" abilities', () => {
                const { context } = contextRef;
                const heroismPrompt = 'If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase';
                const villainyPrompt = 'If there a Villainy card in your discard pile, you may give a unit -3/-3 for this phase';

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Anakin Skywalker to trigger its "When Played" abilities
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveExactPromptButtons([heroismPrompt, villainyPrompt]);
                context.player1.clickPrompt(heroismPrompt);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Anakin Skywalker's first ability resolves again
                expect(context.player1).toHavePrompt(heroismPrompt);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.greenSquadronAwing).toBeInZone('discard');

                // Anakin Skywalker's second ability resolves
                expect(context.player1).toHavePrompt(villainyPrompt);
                context.player1.clickCard(context.phoenixSquadronAwing);

                expect(context.phoenixSquadronAwing).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Unique "When Played" abilities:', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        base: { card: 'echo-base', damage: 3 },
                        hand: [
                            'regional-governor', // When Played: Name a card. While this unit is in play, opponents can't play the named card.
                            'huyang#enduring-instructor', // When Played: Choose another friendly unit. While this unit is in play, the chosen unit gets +2/+2.
                            'fenn-rau#protector-of-concord-dawn', // When Played: You may play an upgrade from your hand. It costs [2 Resources] less.
                            'osi-sobeck#warden-of-the-citadel', // When Played: This unit captures an enemy non-leader ground unit with cost equal to or less than the number of resources paid to play this unit.
                            'count-dooku#fallen-jedi', // When Played: For each unit you exploited while playing this card, you may deal damage to an enemy unit equal to the power of the exploited unit.
                            'blue-leader#scarif-air-support', // When Played: You may pay [2 Resources]. If you do, move this unit to the ground arena and give 2 Experience tokens to it. (It's a ground unit.)
                            'qira#playing-her-part', // When Played: Look at an opponent's hand, then name a card. While this unit is in play, each card with that name costs [3 Resources] more for your opponents to play.
                            'academy-training',
                            'inspiring-mentor'
                        ],
                        spaceArena: [
                            'quigon-jinns-aethersprite#guided-by-the-force',
                            'alliance-xwing',
                            'xwing',
                        ],
                        groundArena: [
                            'consular-security-force',
                        ]
                    },
                    player2: {
                        hand: [
                            'takedown',
                            'vanquish'
                        ],
                        spaceArena: [
                            'green-squadron-awing',
                            'phoenix-squadron-awing'
                        ],
                        groundArena: [
                            'battlefield-marine',
                            'echo-base-defender',
                        ],
                    }
                });
            });

            it('Regional Governor', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Regional Governor, naming Takedown
                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Takedown');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Regional Governor's ability resolves again
                context.player1.chooseListOption('Vanquish');

                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toBeAbleToSelectNoneOf([context.takedown, context.vanquish]);
            });

            it('Huyang', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Huyang, giving +2/+2 to the Alliance X-Wing
                context.player1.clickCard(context.huyang);
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.getPower()).toBe(4);
                expect(context.allianceXwing.getHp()).toBe(5);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Huyang's ability resolves again
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('Fenn Rau', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Fenn Rau, playing Academy Training for 2 less resources
                context.player1.clickCard(context.fennRau);
                const readyResourceCount = context.player1.readyResourceCount;

                expect(context.player1).toBeAbleToSelectExactly([
                    context.academyTraining,
                    context.inspiringMentor,
                ]);

                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.consularSecurityForce);

                // Academy Training is played for 2 less resources (free)
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['academy-training']);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Fenn Rau's ability resolves again
                expect(context.player1).toBeAbleToSelectExactly([context.inspiringMentor]);
                context.player1.clickCard(context.inspiringMentor);
                context.player1.clickCard(context.consularSecurityForce);

                // Inspiring Mentor is played for 2 less resources (free)
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['academy-training', 'inspiring-mentor']);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount);
                expect(context.player2).toBeActivePlayer();
            });

            it('Osi Sobeck', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Osi Sobeck, capturing Battlefield Marine
                context.player1.clickCard(context.osiSobeck);
                context.player1.clickPrompt('Play without Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.echoBaseDefender]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.osiSobeck);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Osi Sobeck's ability resolves again
                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                context.player1.clickCard(context.echoBaseDefender);

                expect(context.echoBaseDefender).toBeCapturedBy(context.osiSobeck);
                expect(context.player2).toBeActivePlayer();
            });

            it('Count Dooku', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Count Dooku, exploiting an X-Wing
                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Trigger exploit');
                context.player1.clickCard(context.xwing);
                context.player1.clickPrompt('Done');

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Count Dooku's ability resolves again
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.echoBaseDefender.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('Blue Leader', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Blue Leader, moving to the ground arena and giving 2 Experience tokens
                context.player1.clickCard(context.blueLeader);
                context.player1.clickPrompt('Pay 2 resources');
                const readyResources = context.player1.readyResourceCount;
                context.player1.clickPrompt('Trigger');

                expect(context.player1.readyResourceCount).toBe(readyResources - 2);
                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Blue Leader's ability resolves again
                expect(context.player1.readyResourceCount).toBe(readyResources - 4);
                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('Qira (naming two different cards)', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Qira, naming Takedown
                context.player1.clickCard(context.qira);
                context.player1.clickPrompt('Done');
                context.player1.chooseListOption('Takedown');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Qira's ability resolves again, naming Vanquish
                context.player1.clickPrompt('Done');
                context.player1.chooseListOption('Vanquish');
                expect(context.player2).toBeActivePlayer();

                // Player 2 plays Takedown for 7 resources
                const readyResourceCount = context.player2.readyResourceCount;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.allianceXwing);

                expect(context.player2.readyResourceCount).toBe(readyResourceCount - 7);

                context.player1.passAction();

                // Player 2 plays Vanquish for 8 resources
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.quigonJinnsAethersprite);

                expect(context.player2.readyResourceCount).toBe(readyResourceCount - 15);
            });

            it('Qira (naming the same card twice)', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Qira, naming Takedown
                context.player1.clickCard(context.qira);
                context.player1.clickPrompt('Done');
                context.player1.chooseListOption('Takedown');

                // Aethersprite's ability is triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Qira's ability resolves again, naming Takedown
                context.player1.clickPrompt('Done');
                context.player1.chooseListOption('Takedown');
                expect(context.player2).toBeActivePlayer();

                // Player 2 plays Takedown for 10 resources
                const readyResourceCount = context.player2.readyResourceCount;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.allianceXwing);

                expect(context.player2.readyResourceCount).toBe(readyResourceCount - 10);
            });
        });
    });
});