describe('General Grievous, Four-Armed Menace', function() {
    integration(function(contextRef) {
        const experienceChoice = 'Give an Experience token to General Grievous';
        const healChoice = 'Heal 3 damage from your base';
        const drawChoice = 'Draw a card';

        // an option already chosen this phase is still shown, as a disabled button with this badge
        const alreadyChosen = (choice: string) => `(Already chosen) ${choice}`;

        describe('when you play an upgrade on him', function() {
            it('shows each option already chosen this phase as unavailable', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion', 'electrostaff', 'academy-training'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play first upgrade on Grievous, all options are available, choose experience
                context.player1.clickCard(context.entrenched);
                expect(context.player1).toHavePrompt('Attach Entrenched to a unit');
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
                context.player1.clickPrompt(experienceChoice);

                expect(context.generalGrievous).toHaveExactUpgradeNames(['entrenched', 'experience']);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // Play second upgrade, experience is shown but can't be chosen, choose heal
                context.player1.clickCard(context.devotion);
                expect(context.player1).toHavePrompt('Attach Devotion to a unit');
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([alreadyChosen(experienceChoice), healChoice, drawChoice]);
                expect(context.player1).toHaveDisabledPromptButton(alreadyChosen(experienceChoice));
                context.player1.clickPrompt(healChoice);

                expect(context.p1Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // Play third upgrade, only draw can be chosen
                context.player1.clickCard(context.electrostaff);
                expect(context.player1).toHavePrompt('Attach Electrostaff to a unit');
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([alreadyChosen(experienceChoice), alreadyChosen(healChoice), drawChoice]);
                expect(context.player1).toHaveDisabledPromptButtons([alreadyChosen(experienceChoice), alreadyChosen(healChoice)]);
                context.player1.clickPrompt(drawChoice);

                expect(context.player1.handSize).toBe(2);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // Play fourth upgrade, every option has been chosen this phase so the ability does nothing
                context.player1.clickCard(context.academyTraining);
                expect(context.player1).toHavePrompt('Attach Academy Training to a unit');
                context.player1.clickCard(context.generalGrievous);

                expect(context.generalGrievous).toHaveExactUpgradeNames([
                    'entrenched',
                    'experience',
                    'devotion',
                    'electrostaff',
                    'academy-training'
                ]);
                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when an upgrade is played on another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace', 'wampa'],
                        hand: ['entrenched']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play an upgrade on Wampa, Grievous does not trigger
                context.player1.clickCard(context.entrenched);
                expect(context.player1).toHavePrompt('Attach Entrenched to a unit');
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['entrenched']);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when the opponent plays an upgrade on him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hand: ['electrostaff']
                    }
                });

                const { context } = contextRef;

                // Opponent plays an upgrade on Grievous, he does not trigger
                context.player1.passAction();

                context.player2.clickCard(context.electrostaff);
                expect(context.player2).toHavePrompt('Attach Electrostaff to a unit');
                context.player2.clickCard(context.generalGrievous);

                expect(context.generalGrievous).toHaveExactUpgradeNames(['electrostaff']);
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger when a token upgrade is given to him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['moment-of-peace']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Give a Shield token to Grievous, he does not trigger
                context.player1.clickCard(context.momentOfPeace);
                expect(context.player1).toHavePrompt('Give a shield token to a unit');
                context.player1.clickCard(context.generalGrievous);

                expect(context.generalGrievous).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('choice tracking', function() {
            it('counts an option as chosen even if it had no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Choose heal while the base has no damage
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
                context.player1.clickPrompt(healChoice);

                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // Heal can't be chosen again
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, alreadyChosen(healChoice), drawChoice]);
                context.player1.clickPrompt(drawChoice);

                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('ignores a click on an option already chosen this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickPrompt(drawChoice);
                context.player2.passAction();

                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.generalGrievous);
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, alreadyChosen(drawChoice)]);

                // send the click directly, the way a client would, even though the button is disabled
                const drawButton = context.player1.currentPrompt().buttons
                    .find((button) => button.text === alreadyChosen(drawChoice));
                expect(context.game.menuButton(context.player1.player.id, drawButton.arg, drawButton.uuid, undefined)).toBe(false);
                context.game.continue();

                // the card drawn by the first choice, and no more
                expect(context.player1.handSize).toBe(1);
                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, alreadyChosen(drawChoice)]);
                context.player1.clickPrompt(experienceChoice);

                expect(context.generalGrievous).toHaveExactUpgradeNames(['entrenched', 'devotion', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('offers every option again in the next phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Choose draw this phase
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                context.player1.clickPrompt(drawChoice);
                expect(context.player1.handSize).toBe(2);

                // Move to the next action phase, 2 cards are drawn in the regroup phase
                context.moveToNextActionPhase();
                expect(context.player1.handSize).toBe(4);

                // All options are offered again
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
                context.player1.clickPrompt(drawChoice);

                expect(context.player1.handSize).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('offers every option again after he leaves play and is played again', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion', 'waylay']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Choose draw this phase
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                context.player1.clickPrompt(drawChoice);
                expect(context.player1.handSize).toBe(3);
                context.player2.passAction();

                // Return Grievous to hand with Waylay
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.generalGrievous);
                expect(context.generalGrievous).toBeInZone('hand');
                context.player2.passAction();

                // Replay Grievous
                context.player1.clickCard(context.generalGrievous);
                expect(context.generalGrievous).toBeInZone('groundArena');
                context.player2.passAction();

                // Draw is offered again on the replayed Grievous
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
                context.player1.clickPrompt(drawChoice);

                expect(context.player1.handSize).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('tracks the chosen options separately for each copy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched', 'devotion'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['electrostaff']
                    }
                });

                const { context } = contextRef;
                const p1Grievous = context.player1.findCardByName('general-grievous#fourarmed-menace');
                const p2Grievous = context.player2.findCardByName('general-grievous#fourarmed-menace');

                // Player 1 chooses draw on their Grievous
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(p1Grievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                context.player1.clickPrompt(drawChoice);

                // Player 2's Grievous still offers every option
                context.player2.clickCard(context.electrostaff);
                context.player2.clickCard(p2Grievous);

                expect(context.player2).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player2).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
                context.player2.clickPrompt(drawChoice);

                expect(context.player2.handSize).toBe(1);

                // Player 1's Grievous still has draw used up
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(p1Grievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, alreadyChosen(drawChoice)]);
                context.player1.clickPrompt(experienceChoice);

                expect(p1Grievous).toHaveExactUpgradeNames([
                    'entrenched',
                    'devotion',
                    'experience'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('keeps the chosen options when an opponent takes control of him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#fourarmed-menace'],
                        hand: ['entrenched']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hand: ['change-of-heart', 'electrostaff'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });

                const { context } = contextRef;

                // Player 1 chooses draw
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.generalGrievous);

                expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
                context.player1.clickPrompt(drawChoice);

                // Player 2 takes control of Grievous
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.generalGrievous);
                expect(context.generalGrievous).toBeInZone('groundArena', context.player2);
                context.player1.passAction();

                // Player 2 plays an upgrade on Grievous
                context.player2.clickCard(context.electrostaff);
                context.player2.clickCard(context.generalGrievous);

                // The options are tracked on the card, not per player, so Draw a card has already been chosen
                expect(context.player2).toHavePrompt('Choose an effect for General Grievous');
                expect(context.player2).toHaveExactPromptButtons([experienceChoice, healChoice, alreadyChosen(drawChoice)]);
                context.player2.clickPrompt(healChoice);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
