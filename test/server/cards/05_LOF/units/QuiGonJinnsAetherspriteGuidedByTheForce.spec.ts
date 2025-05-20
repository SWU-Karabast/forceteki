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
        1. Using Smuggle:
            Privateer Crew | When played using Smuggle: Give 3 Experience tokens to this unit.
        2. Coordinate (Ability activates when player controls 3 or more units):
            Pelta Supply Frigate | Coordinate - When Played: Create a Clone Trooper Token.
        3. Play type (unit):
            Poe Dameron, One Hell of a Pilot | When played as a unit: Create an X-Wing token.
            You may attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it.
        4. Play type (upgrade):
            Snap Wexley, Resistance Recon Flier | When played as an upgrade: Search the top 5
            cards of your deck for a Resistance card, reveal it, and draw it.
        5. Combined ability:
            Reinforcement Walker | When Played/On Attack: Look at the top card of your deck. Either
            draw that card or discard it and heal 3 damage from your base.
        6. Multiple "When Played" abilities:
            Anakin Skywalker, Champion of Mortis | When Played: If there is a [Heroism] card in your
            discard pile, you may give a unit -3/-3 for this phase. | When Played: If there is a
            [Villainy] card in your discard pile, you may give a unit -3/-3 for this phase.

    Unique "When Played" abilities to verify:
        1. Regional Governor | When Played: Name a card. While this unit is in play, opponents can't
           play the named card.
        2. Huyang, Enduring Instructor | When Played: Choose another friendly unit. While this unit is
           in play, the chosen unit gets +2/+2.
        3. Mon Mothma, Voice of the Rebellion | When Played: Search the top 5 cards of your deck for a
           Rebel card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a
           random order.)
        4. Fenn Rau, Protector of Concord Dawn | When Played: You may play an upgrade from your hand.
           It costs [2 Resources] less.
        5. Osi Sobeck, Warden of the Citadel | When Played: This unit captures an enemy non-leader ground
           unit with cost equal to or less than the number of resources paid to play this unit.
        6. Count Dooku, Fallen Jedi | When Played: For each unit you exploited while playing this card,
           you may deal damage to an enemy unit equal to the power of the exploited unit.
        7. Blue Leader, Scarif Air Support | When Played: You may pay [2 Resources]. If you do, move this
           unit to the ground arena and give 2 Experience tokens to it. (It's a ground unit.)
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
    });
});