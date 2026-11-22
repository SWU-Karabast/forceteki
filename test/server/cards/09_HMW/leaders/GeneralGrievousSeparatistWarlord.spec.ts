describe('General Grievous, Separatist Warlord', function () {
    integration(function (contextRef) {
        describe('General Grievous\'s leader side ability', function () {
            const playTwoUnitsPrompt = 'Play 2 units from your hand';

            it('should play two units from hand, one at a time, each paying its own cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        resources: 4,
                        hand: [
                            'imperial-dark-trooper', // cost 2
                            'confederate-courier',   // cost 2
                            'generals-guardian'      // cost 4
                        ],
                    }
                });

                const { context } = contextRef;

                // Deploying Grievous costs 5, which isn't affordable, so clicking him triggers this ability directly
                context.player1.clickCard(context.generalGrievous);

                // All three units are in-aspect (Command/Villainy), so none incur an aspect penalty; all are affordable with 4 resources
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.imperialDarkTrooper, context.confederateCourier, context.generalsGuardian]);
                context.player1.clickCard(context.imperialDarkTrooper);

                // Only 2 resources remain, so General's Guardian (cost 4) is no longer affordable
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.confederateCourier]);
                context.player1.clickCard(context.confederateCourier);

                // Both units are played, all resources are spent, and Grievous is exhausted
                expect(context.imperialDarkTrooper).toBeInZone('groundArena', context.player1);
                expect(context.confederateCourier).toBeInZone('spaceArena', context.player1);
                expect(context.generalsGuardian).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.generalGrievous.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // The action and each individual play generate sensible game log messages
                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses General Grievous, exhausting General Grievous to play multiple cards from their hand',
                    'player1 plays Imperial Dark Trooper',
                    'player1 plays Confederate Courier'
                ]);
            });

            it('should only allow unit cards to be selected, not events', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        hand: ['imperial-dark-trooper', 'takedown'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Deploying Grievous costs 5, which isn't affordable, so clicking him triggers this ability directly
                context.player1.clickCard(context.generalGrievous);

                // Takedown is an event and is excluded from selection even though it is affordable
                expect(context.player1).toBeAbleToSelectExactly([context.imperialDarkTrooper]);
                context.player1.clickCard(context.imperialDarkTrooper);

                // No further unit is available to play, so the ability ends
                expect(context.imperialDarkTrooper).toBeInZone('groundArena', context.player1);
                expect(context.takedown).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve the first unit\'s When Played ability, including its own targeting, before offering the next selection', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        hand: ['death-trooper', 'death-star-stormtrooper']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Activate Grievous's ability
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickPrompt(playTwoUnitsPrompt);

                // Select and play Death Trooper first
                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathTrooper);

                // Death Trooper's own When Played ability resolves fully, including its damage targets, before Grievous offers the next selection
                expect(context.deathTrooper).toBeInZone('groundArena', context.player1);
                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);

                // Grievous's ability resumes, offering the second unit
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Death Trooper costs 5 and Death Star Stormtrooper costs 1 (both aspects matched), for 6 total resources spent
                expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should play the only unit in hand and complete without offering a second selection', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        hand: ['imperial-dark-trooper'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Activate Grievous's ability and play the only available unit
                context.player1.clickCard(context.generalGrievous);
                expect(context.player1).toBeAbleToSelectExactly([context.imperialDarkTrooper]);
                context.player1.clickCard(context.imperialDarkTrooper);

                // Ability completes after playing the only unit; no second selection is offered
                expect(context.imperialDarkTrooper).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.generalGrievous.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should still exhaust General Grievous when there are no units in hand to play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Deploying Grievous costs 5, which isn't affordable, so clicking him triggers this ability directly
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickPrompt('Use it anyway');

                expect(context.generalGrievous.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline playing a second unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        hand: ['imperial-dark-trooper', 'confederate-courier']
                    }
                });

                const { context } = contextRef;

                // Activate Grievous's ability
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickPrompt(playTwoUnitsPrompt);

                // Select and play Imperial Dark Trooper (Confederate Courier is also affordable)
                expect(context.player1).toBeAbleToSelectExactly([context.imperialDarkTrooper, context.confederateCourier]);
                context.player1.clickCard(context.imperialDarkTrooper);

                // Decline to play a second unit
                expect(context.player1).toBeAbleToSelectExactly([context.confederateCourier]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // Only Imperial Dark Trooper was played
                expect(context.imperialDarkTrooper).toBeInZone('groundArena', context.player1);
                expect(context.confederateCourier).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('General Grievous\'s leader unit side ability', function () {
            it('should get +3/+0 while controlling more units than the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'general-grievous#separatist-warlord', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player1 controls 2 units (Grievous, Battlefield Marine), player2 controls 1 (Wampa)
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
            });

            it('should not get +3/+0 while controlling the same number of units as the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'general-grievous#separatist-warlord', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player1 controls 1 unit (Grievous), player2 controls 1 (Wampa)
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
            });

            it('should not get +3/+0 while controlling fewer units than the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'general-grievous#separatist-warlord', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Player1 controls 1 unit (Grievous), player2 controls 2 (Wampa, Battlefield Marine)
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
            });

            it('should turn on and off dynamically as the relative unit count changes', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'general-grievous#separatist-warlord', deployed: true },
                        hand: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Round 1: tied 1-1, no buff
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                context.moveToNextActionPhase();

                // Round 2: play a second friendly unit to take the lead, 2-1, buff active
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(9);

                // Player2 defeats Battlefield Marine in combat, returning the unit count to 1-1
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                context.moveToNextActionPhase();

                // Round 3: tied again, no buff
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(12);
            });
        });
    });
});
