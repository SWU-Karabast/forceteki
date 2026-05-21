describe('Eye of Sion, Delivered From Exile', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Search the top 8 cards of your deck for a unit that costs the same as or less than this unit\'s power. Play it for free. It enters play ready.';

        it('should search the top 8 cards for a unit with cost equal to or less than its power, play it for free, and ready it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['eye-of-sion#delivered-from-exile'],
                    deck: [
                        'wampa',
                        'green-squadron-awing',
                        'atst',
                        'repair',
                        'vanguard-infantry',
                        'takedown',
                        'pyke-sentinel',
                        'battlefield-marine',
                        'blue-squadron-assault-wing'
                    ],
                    resources: 1
                }
            });

            const { context } = contextRef;
            const readyResources = context.player1.readyResourceCount;

            context.player1.clickCard(context.eyeOfSion);
            expect(context.player1).toHavePrompt('Choose an ability:');
            context.player1.clickPrompt(abilityTitle);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [
                    context.wampa,
                    context.greenSquadronAwing,
                    context.vanguardInfantry,
                    context.pykeSentinel,
                    context.battlefieldMarine
                ],
                invalid: [
                    context.atst,
                    context.repair,
                    context.takedown
                ]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).not.toHaveEnabledPromptButton('Done');

            context.player1.clickCardInDisplayCardPrompt(context.greenSquadronAwing);

            expect(context.eyeOfSion.exhausted).toBeTrue();
            expect(context.greenSquadronAwing).toBeInZone('spaceArena', context.player1);
            expect(context.greenSquadronAwing.exhausted).toBeFalse();
            expect(context.player1.readyResourceCount).toBe(readyResources);
            expect([
                context.wampa,
                context.atst,
                context.repair,
                context.vanguardInfantry,
                context.takedown,
                context.pykeSentinel,
                context.battlefieldMarine
            ]).toAllBeInBottomOfDeck(context.player1, 7);
            expect(context.player1.deck[0]).toBe(context.blueSquadronAssaultWing);
            expect(context.player2).toBeActivePlayer();
        });

        it('should use this unit\'s current power when checking eligible unit costs', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'eye-of-sion#delivered-from-exile', upgrades: ['experience'] }],
                    deck: [
                        'blue-squadron-assault-wing',
                        'atst',
                        'repair',
                        'vanguard-infantry',
                        'takedown',
                        'pyke-sentinel',
                        'battlefield-marine',
                        'green-squadron-awing'
                    ],
                    resources: 1
                }
            });

            const { context } = contextRef;

            expect(context.eyeOfSion.getPower()).toBe(6);

            context.player1.clickCard(context.eyeOfSion);
            context.player1.clickPrompt(abilityTitle);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [
                    context.blueSquadronAssaultWing,
                    context.atst,
                    context.vanguardInfantry,
                    context.pykeSentinel,
                    context.battlefieldMarine,
                    context.greenSquadronAwing
                ],
                invalid: [
                    context.repair,
                    context.takedown
                ]
            });

            context.player1.clickCardInDisplayCardPrompt(context.blueSquadronAssaultWing);

            expect(context.blueSquadronAssaultWing).toBeInZone('spaceArena', context.player1);
            expect(context.blueSquadronAssaultWing.exhausted).toBeFalse();
            expect(context.player1.readyResourceCount).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow taking nothing and move only the searched cards to the bottom of the deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['eye-of-sion#delivered-from-exile'],
                    deck: [
                        'wampa',
                        'green-squadron-awing',
                        'atst',
                        'repair',
                        'vanguard-infantry',
                        'takedown',
                        'pyke-sentinel',
                        'battlefield-marine',
                        'blue-squadron-assault-wing'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.eyeOfSion);
            context.player1.clickPrompt(abilityTitle);
            context.player1.clickPrompt('Take nothing');

            expect([
                context.wampa,
                context.greenSquadronAwing,
                context.atst,
                context.repair,
                context.vanguardInfantry,
                context.takedown,
                context.pykeSentinel,
                context.battlefieldMarine
            ]).toAllBeInBottomOfDeck(context.player1, 8);
            expect(context.player1.deck[0]).toBe(context.blueSquadronAssaultWing);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
