describe('Osha, Haunted By Her Past', function () {
    integration(function (contextRef) {
        describe('Osha\'s leader side ability', function () {
            it('plays a Villainy unit from resources ignoring its Villainy aspect penalty, then resources a card from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (friendly Heroism) is defeated in combat, satisfying Osha's condition
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                context.player2.passAction();

                context.player1.clickCard(context.osha);
                expect(context.player1).toHavePrompt('Choose a Villainy unit to play from your resources');
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.osha.exhausted).toBe(true);

                // only 2 other resources are exhausted: the commandos help pay their own cost of 3. With the
                // Villainy penalty applied they would cost 5 and could not have been afforded at all
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.resources.length).toBe(3);

                expect(context.player1).toHavePrompt('Resource a card from your hand');
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                expect(context.player1).toHavePassAbilityButton(); // optional ability
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.powerOfTheDarkSide).toBeInZone('resource', context.player1);
                expect(context.powerOfTheDarkSide.exhausted).toBe(true);
                expect(context.player1.resources.length).toBe(4);

                // the resourced card is deliberately not named in the log, since resources are hidden information
                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses Osha, exhausting Osha to play Mandalorian Super Commandos from their resource row',
                    'player1 plays Mandalorian Super Commandos from their resource row',
                    'player1 uses Osha to move a card to their resources'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('is satisfied when the friendly Heroism unit was defeated by the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Battlefield Marine (Heroism)
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                // Osha's condition is satisfied, so her action ability plays the Villainy unit
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.osha.exhausted).toBe(true);
                expect(context.player1.resources.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('is satisfied when a friendly Heroism token unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['clone-trooper'],
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Clone Trooper token (Heroism)
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.cloneTrooper);

                // Osha's condition is satisfied, so her action ability plays the Villainy unit
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.osha.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('is not satisfied when only an enemy Heroism unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        // kept below Osha's deploy cost of 6 so deploying isn't offered as a competing action
                        resources: 3
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the enemy Battlefield Marine (Heroism)
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                // Osha's condition is not satisfied since no friendly Heroism unit was defeated
                context.player1.clickCard(context.osha);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.osha.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('is not satisfied when only a friendly non-Heroism unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['wampa'],
                        resources: 3
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Wampa (non-Heroism)
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);

                // Osha's condition is not satisfied since Wampa doesn't have Heroism
                context.player1.clickCard(context.osha);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.osha.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('is not satisfied in a later phase, since the watcher is scoped to the current phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        resources: 3
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Battlefield Marine (Heroism) during the first action phase
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                // Osha's condition is not satisfied since the defeat happened in a previous phase
                context.player1.clickCard(context.osha);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.osha.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be used while the leader is already exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', exhausted: true },
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        resources: 3
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Battlefield Marine (Heroism), satisfying Osha's condition
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.osha).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('still applies a non-Villainy unmatched aspect penalty when playing the chosen unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        // imperial-dark-trooper is Command + Villainy, so only the Villainy penalty is ignored
                        resources: ['imperial-dark-trooper', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Battlefield Marine (Heroism), satisfying Osha's condition
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                // Osha's action ability plays the Villainy unit, still paying the Command aspect penalty
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.imperialDarkTrooper]);
                context.player1.clickCard(context.imperialDarkTrooper);

                expect(context.imperialDarkTrooper).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('is a soft pass, only exhausting the leader, when the chosen unit cannot be afforded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        // the Villainy unit is the only resource, so nothing else can pay its cost of 3
                        resources: ['mandalorian-super-commandos']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Battlefield Marine (Heroism), satisfying Osha's condition
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);

                // The chosen unit can't be afforded, so the ability is a soft pass that only exhausts Osha
                context.player1.clickCard(context.osha);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.osha.exhausted).toBe(true);
                expect(context.mandalorianSuperCommandos).toBeInZone('resource', context.player1);
                expect(context.player1.resources.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to decline the resource-a-card prompt despite having a valid target', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['battlefield-marine'],
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (friendly Heroism) is defeated in combat, satisfying Osha's condition
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.osha);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                // Power of the Dark Side is a legal target, but the tail is optional so it can be declined
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.powerOfTheDarkSide).toBeInZone('hand', context.player1);
                expect(context.player1.resources.length).toBe(3);
                // declining logs nothing further, so the play lines are still the most recent entries
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Osha, exhausting Osha to play Mandalorian Super Commandos from their resource row',
                    'player1 plays Mandalorian Super Commandos from their resource row'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not prompt to resource a card from hand when no unit was played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'osha#haunted-by-her-past',
                        base: 'lake-country',
                        groundArena: ['wampa'],
                        hand: ['power-of-the-dark-side'],
                        resources: 3
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Vanquish defeats the friendly Wampa (non-Heroism), so Osha's condition isn't met
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);

                // Soft-pass Osha's ability; since no unit was played, the resource-a-card tail never appears
                context.player1.clickCard(context.osha);
                context.player1.clickPrompt('Use it anyway');

                expect(context.osha.exhausted).toBe(true);
                expect(context.powerOfTheDarkSide).toBeInZone('hand', context.player1);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Osha\'s leader unit side ability', function () {
            it('plays a Villainy unit from resources ignoring its Villainy aspect penalty, then resources a card from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // no friendly Heroism unit was defeated this phase; the deployed side has no such precondition
                context.player1.clickCard(context.osha);
                expect(context.player1).toHavePrompt('Choose a Villainy unit to play from your resources');
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);

                // only 2 other resources are exhausted: the commandos help pay their own cost of 3. With the
                // Villainy penalty applied they would cost 5 and could not have been afforded at all
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.resources.length).toBe(3);

                expect(context.player1).toHavePrompt('Resource a card from your hand');
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.powerOfTheDarkSide).toBeInZone('resource', context.player1);
                expect(context.powerOfTheDarkSide.exhausted).toBe(true);
                expect(context.player1.resources.length).toBe(4);

                // the resourced card is deliberately not named in the log, since resources are hidden information
                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses Osha to play Mandalorian Super Commandos from their resource row',
                    'player1 plays Mandalorian Super Commandos from their resource row',
                    'player1 uses Osha to move a card to their resources'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('has no cost, so using it does not exhaust the deployed unit', async function () {
                const unitSideAbilityTitle = 'Play a Villainy unit from your resources, ignoring its Villainy aspect penalties';

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Osha is ready, so both the action ability and Attack are legal options
                context.player1.clickCard(context.osha);
                expect(context.player1).toHavePrompt('Choose an ability:');
                expect(context.player1).toHaveExactPromptButtons([unitSideAbilityTitle, 'Attack', 'Cancel']);
                context.player1.clickPrompt(unitSideAbilityTitle);

                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.osha.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('is not offered when there is no legal Villainy unit in resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true },
                        base: 'lake-country',
                        resources: ['underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // The ability has no legal target, so the only remaining legal action (Attack) is used directly
                context.player1.clickCard(context.osha);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('ignores the Villainy aspect penalty, paying only the printed cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        // commandos cost 3; with the Villainy penalty applied they would cost 5 and be unaffordable here
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Play the Villainy unit from resources
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('drops the total resource count by exactly one and does not draw a replacement from the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        deck: ['moisture-farmer']
                    }
                });

                const { context } = contextRef;

                // Play the Villainy unit from resources
                context.player1.clickCard(context.osha);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                // The total resource count only drops by one; no card is drawn to replace it
                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.moistureFarmer).toBeInZone('deck', context.player1);
                expect(context.player1.resources.length).toBe(3);
            });

            it('cannot select non-Villainy units in resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Only the Villainy unit (not the neutral Underworld Thugs) is a legal target
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
            });

            it('cannot select non-unit cards in resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        // power-of-the-dark-side has a Villainy icon but is an event, not a unit
                        resources: ['mandalorian-super-commandos', 'power-of-the-dark-side', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // The event is not a legal target even though it has a Villainy icon
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
            });

            it('cannot select Villainy units in hand or discard, only the resource zone', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug'],
                        hand: ['ruthless-assassin'],
                        discard: ['imperial-dark-trooper']
                    }
                });

                const { context } = contextRef;

                // Only the resource-zone unit is a legal target, despite Villainy units in hand and discard
                context.player1.clickCard(context.osha);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianSuperCommandos]);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                // Decline the resulting "resource a card from hand" tail to leave hand/discard untouched
                context.player1.clickPrompt('Pass');

                expect(context.mandalorianSuperCommandos).toBeInZone('groundArena', context.player1);
                expect(context.ruthlessAssassin).toBeInZone('hand', context.player1);
                expect(context.imperialDarkTrooper).toBeInZone('discard', context.player1);
            });

            it('allows the player to decline the resource-a-card prompt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: ['mandalorian-super-commandos', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        hand: ['power-of-the-dark-side']
                    }
                });

                const { context } = contextRef;

                // Play the Villainy unit from resources
                context.player1.clickCard(context.osha);
                context.player1.clickCard(context.mandalorianSuperCommandos);

                // Decline the "resource a card from hand" tail
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.powerOfTheDarkSide).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('resolves the played unit\'s own When Played ability before the resource-a-card prompt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        groundArena: ['wampa'],
                        // ruthless-assassin: When Played: Deal 2 damage to a friendly unit
                        resources: ['ruthless-assassin', 'underworld-thug', 'underworld-thug'],
                        hand: ['power-of-the-dark-side']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.osha);
                context.player1.clickCard(context.ruthlessAssassin);

                // Ruthless Assassin's own When Played ability resolves first
                expect(context.player1).toHavePrompt('Deal 2 damage to a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.osha, context.wampa, context.ruthlessAssassin]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);

                // Only after the When Played ability resolves does the resource-a-card tail appear
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.ruthlessAssassin).toBeInZone('groundArena', context.player1);
                expect(context.powerOfTheDarkSide).toBeInZone('resource', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('lets an Ambush unit complete its attack before the resource-a-card prompt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'osha#haunted-by-her-past', deployed: true, exhausted: true },
                        base: 'lake-country',
                        resources: [
                            'fetts-firespray#in-pursuit',
                            'underworld-thug', 'underworld-thug', 'underworld-thug',
                            'underworld-thug', 'underworld-thug', 'underworld-thug'
                        ],
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        // Fett's Firespray is a space unit, so its Ambush target must also be in the space arena
                        spaceArena: ['desperado-freighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.osha);
                context.player1.clickCard(context.fettsFirespray);

                // Ambush lets Fett's Firespray attack immediately, nested within the resolving ability
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.desperadoFreighter);

                // Combat resolves fully (both units survive) before the resource-a-card tail is offered
                expect(context.fettsFirespray.damage).toBe(5);
                expect(context.desperadoFreighter.damage).toBe(4);

                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.powerOfTheDarkSide).toBeInZone('resource', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
