describe('Count Dooku, Silver-Tongued', function() {
    integration(function(contextRef) {
        describe('Count Dooku\'s when played ability', function() {
            const exhaustPrompt = 'Exhaust a unit';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['count-dooku#silvertongued'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    },
                });
            });

            it('should exhaust an enemy unit', function() {
                const { context } = contextRef;

                // Play Count Dooku
                context.player1.clickCard(context.countDooku);
                expect(context.player1).toHavePrompt(exhaustPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.countDooku,
                    context.wampa,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.hanSolo,
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Exhaust the enemy unit
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust a friendly unit', function() {
                const { context } = contextRef;

                // Play Count Dooku and exhaust a friendly unit
                context.player1.clickCard(context.countDooku);
                expect(context.player1).toHavePrompt(exhaustPrompt);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when the ability is passed', function() {
                const { context } = contextRef;

                // Play Count Dooku and pass the ability
                context.player1.clickCard(context.countDooku);
                expect(context.player1).toHavePrompt(exhaustPrompt);
                context.player1.clickPrompt('Pass');

                // Assert nothing was exhausted
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.hanSolo.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Count Dooku\'s constant ability', function() {
            it('should limit the opponent to readying 1 ground unit and 1 space unit during the regroup phase', async function() {
                const readyPrompt = 'Choose a ground unit and a space unit to ready';

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued', { card: 'wampa', exhausted: true }],
                        spaceArena: [{ card: 'tieln-fighter', exhausted: true }],
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true, exhausted: true },
                        resources: {
                            exhaustedCount: 2,
                            readyCount: 8
                        },
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'atst', exhausted: true },
                        ],
                        spaceArena: [
                            { card: 'cartel-spacer', exhausted: true },
                            { card: 'awing', exhausted: true },
                        ],
                    },
                });

                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.player2).toHavePrompt(readyPrompt);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.atst,
                    context.hanSolo,
                    context.cartelSpacer,
                    context.awing,
                ]);

                // Choose a ground unit; only it and the space units remain selectable
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toHavePrompt(readyPrompt);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,  // Selectable to be able to un-select
                    context.cartelSpacer,
                    context.awing
                ]);
                expect(context.player2).toHaveDisabledPromptButton('Done');

                // Choose a space unit and confirm
                context.player2.clickCard(context.cartelSpacer);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Assert chat log and ready states
                expect(context.getChatLogs(5)).toContain(
                    'player2 readies Battlefield Marine and Cartel Spacer and leaves AT-ST, Han Solo, and A-Wing exhausted due to Count Dooku'
                );

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.awing.exhausted).toBeTrue();
                expect(context.player2.exhaustedResourceCount).toBe(0);

                // Assert Count Dooku's controller is unaffected
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.tielnFighter.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('should limit the opponent to readying 1 ground unit and 1 space unit in each regroup phase when there is an additional regroup phase', async function() {
                const readyPrompt = 'Choose a ground unit and a space unit to ready';

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued', 'max-rebo#encore'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'atst', exhausted: true },
                            { card: 'wampa', exhausted: true },
                        ],
                        spaceArena: [
                            { card: 'cartel-spacer', exhausted: true },
                            { card: 'awing', exhausted: true },
                            { card: 'tieln-fighter', exhausted: true },
                        ],
                    },
                });

                const { context } = contextRef;

                // Move to the first regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                // Ready Battlefield Marine and Cartel Spacer
                expect(context.player2).toHavePrompt(readyPrompt);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.atst,
                    context.wampa,
                    context.cartelSpacer,
                    context.awing,
                    context.tielnFighter,
                ]);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickDone();

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.awing.exhausted).toBeTrue();
                expect(context.tielnFighter.exhausted).toBeTrue();

                // Max Rebo's additional regroup phase
                expect(context.getChatLogs(3)).toContain('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                context.player1.clickDone();
                context.player2.clickDone();

                // Only the units still exhausted are candidates; ready AT-ST and A-Wing
                expect(context.player2).toHavePrompt(readyPrompt);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.atst,
                    context.wampa,
                    context.awing,
                    context.tielnFighter,
                ]);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.awing);
                context.player2.clickDone();

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.awing.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.player1).toBeActivePlayer();
            });

            it('should count a deployed leader unit toward the ground limit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued'],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true, exhausted: true },
                    },
                });
                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                // Assert the deployed leader is a ground candidate and ready it
                expect(context.player2).toHavePrompt('Choose a ground unit to ready');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.hanSolo
                ]);
                context.player2.clickCard(context.hanSolo);

                expect(context.hanSolo.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player1).toBeActivePlayer();
            });

            it('should only prompt for the arena that has more than one candidate and resolve on a single selection', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'atst', exhausted: true },
                        ],
                        spaceArena: ['cartel-spacer'],
                    },
                });
                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.player2).toHavePrompt('Choose a ground unit to ready');
                // Choose the ground unit to ready; the single space unit is not prompted
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.atst
                ]);
                context.player2.clickCard(context.atst);

                expect(context.atst.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('should not prompt when there is at most one exhausted unit per arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued'],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        spaceArena: [{ card: 'cartel-spacer', exhausted: true }],
                    },
                });
                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('should not count units that cannot ready as candidates', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'atst', exhausted: true, upgrades: ['frozen-in-carbonite'] },
                        ],
                    },
                });
                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.player1).toBeActivePlayer();
            });

            it('should not apply if Count Dooku has been defeated before the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['count-dooku#silvertongued'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'atst', exhausted: true },
                        ],
                        spaceArena: [
                            { card: 'cartel-spacer', exhausted: true },
                            { card: 'awing', exhausted: true },
                        ],
                    },
                });
                const { context } = contextRef;

                // Player 2 defeats Count Dooku with Vanquish
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.countDooku);
                expect(context.countDooku).toBeInZone('discard');

                // Move to the regroup phase
                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.awing.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
