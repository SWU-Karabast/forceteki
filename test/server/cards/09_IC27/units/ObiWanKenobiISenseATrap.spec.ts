describe('Obi-Wan Kenobi, I Sense a Trap', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            const abilityTitle = 'Choose one: play a unit from discard or give a unit -5/-5 for this phase';
            const playUnitMode = 'Play a unit that was defeated this phase from your discard pile. It costs 5 resources less';
            const debuffMode = 'Choose a unit that entered play this phase. It gets -5/-5 for this phase';

            it('can play a unit that was defeated this phase from your discard pile for 5 resources less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#walking-carpet',
                        hand: ['rivals-fall', 'obiwan-kenobi#i-sense-a-trap'],
                        groundArena: ['armored-saber-tank'],
                        discard: ['wampa'],
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.atst);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.armoredSaberTank);

                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePrompt('Choose an effect for Obi-Wan Kenobi');
                expect(context.player1).toHaveExactPromptButtons([playUnitMode, debuffMode, 'Pass']);
                context.player1.clickPrompt(playUnitMode);

                expect(context.player1).toHavePrompt('Play a unit that was defeated this phase for 5 resources less');
                expect(context.player1).toBeAbleToSelectExactly([context.armoredSaberTank]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.armoredSaberTank);

                // Tank costs 6 → discounted to 1. Total spend: 6 (Rival's Fall) + 8 (Obi-Wan) + 1 = 15
                expect(context.armoredSaberTank).toBeInZone('groundArena');
                expect(context.obiwanKenobi).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(15);
            });

            it('can give an enemy unit that entered play this phase -5/-5 for this phase only', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap', 'wampa'],
                    },
                    player2: {
                        hand: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player2.clickCard(context.atst);
                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePrompt('Choose an effect for Obi-Wan Kenobi');
                expect(context.player1).toHaveExactPromptButtons([`(No effect) ${playUnitMode}`, debuffMode, 'Pass']);
                context.player1.clickPrompt(debuffMode);

                expect(context.player1).toHavePrompt('Give -5/-5 to a unit that entered play this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst, context.wampa]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                // AT-ST is 6/7 → -5/-5 leaves it at 1/2 — it survives
                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.getPower()).toBe(1);
                expect(context.atst.getHp()).toBe(2);

                // The modification expires when the phase ends
                context.moveToNextActionPhase();
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });

            it('can be declined from the effect prompt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePrompt('Choose an effect for Obi-Wan Kenobi');
                expect(context.player1).toHaveExactPromptButtons([
                    `(No effect) ${playUnitMode}`,
                    debuffMode,
                    'Pass'
                ]);
                context.player1.clickPrompt('Pass');

                expect(context.obiwanKenobi.getPower()).toBe(5);
                expect(context.obiwanKenobi.getHp()).toBe(9);
                expect(context.player2).toBeActivePlayer();
            });

            it('can choose nothing after choosing an effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap']
                    },
                    player2: {
                        hand: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.atst);
                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePrompt('Choose an effect for Obi-Wan Kenobi');
                context.player1.clickPrompt('Choose a unit that entered play this phase. It gets -5/-5 for this phase');

                expect(context.player1).toHavePrompt('Give -5/-5 to a unit that entered play this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                expect(context.obiwanKenobi.getPower()).toBe(5);
                expect(context.obiwanKenobi.getHp()).toBe(9);
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be declined from the trigger resolution prompt when it triggers alongside another ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap'],
                        groundArena: ['mas-amedda#vice-chair']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePassableTriggerPrompt(abilityTitle, context.obiwanKenobi);
                context.player1.clickPass(abilityTitle, context.obiwanKenobi);

                // Mas Amedda's trigger is the only one left
                expect(context.player1).toHavePassableTriggerPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                context.player1.clickPass();

                expect(context.obiwanKenobi.getPower()).toBe(5);
                expect(context.obiwanKenobi.getHp()).toBe(9);
                expect(context.masAmedda.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('can still be declined from the effect prompt after it is triggered from the trigger resolution prompt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap'],
                        groundArena: ['mas-amedda#vice-chair']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['atst']
                    }
                });

                const { context } = contextRef;

                // P2 plays AT-ST, then P1 plays Obi-Wan Kenobi
                context.player2.clickCard(context.atst);
                context.player1.clickCard(context.obiwanKenobi);

                // P1 sees the trigger resolution order prompt
                expect(context.player1).toHaveExactTriggerResolutionPrompt([
                    { title: abilityTitle, optional: true, source: context.obiwanKenobi },
                    { title: 'Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it', optional: true, source: context.masAmedda }
                ]);

                // Choose to resolve Obi-Wan Kenobi's ability
                context.player1.clickTrigger(abilityTitle, context.obiwanKenobi);
                expect(context.player1).toHavePrompt('Choose an effect for Obi-Wan Kenobi');
                expect(context.player1).toHaveExactPromptButtons([
                    `(No effect) ${playUnitMode}`,
                    debuffMode,
                    'Pass'
                ]);
                context.player1.clickPrompt(debuffMode);

                expect(context.player1).toHavePrompt('Give -5/-5 to a unit that entered play this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(1);
                expect(context.atst.getHp()).toBe(2);

                expect(context.player1).toHavePassableTriggerPrompt('Exhaust this unit to search the top 4 cards of your deck for a unit, reveal it, and draw it');
                context.player1.clickPass();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
