describe('U-Wing Reinforcement', function() {
    integration(function(contextRef) {
        describe('U-Wing\'s ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['uwing-reinforcement'],
                        deck: [
                            'wampa',
                            'vanguard-infantry',
                            'battlefield-marine',
                            'hunting-nexu',
                            'cartel-turncoat',
                            'daring-raid',
                            'protector',
                            'strike-true',
                            'atat-suppressor',
                            'aurra-sing#crackshot-sniper',
                            'atst'
                        ],
                    }
                });
            });

            it('should search the top 10 cards and play out up to 3 units with total cost <= 7 for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);

                expect(context.player1).toHavePrompt('Choose up to 3 units with combined cost 7 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // click on Aurra (cost 7) first and confirm that it makes everything else unselectable
                context.player1.clickCardInDisplayCardPrompt(context.aurraSingCrackshotSniper);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.aurraSingCrackshotSniper],
                    unselectable: [context.huntingNexu, context.vanguardInfantry, context.battlefieldMarine, context.cartelTurncoat, context.wampa],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                // click on Aurra again to unselect her and confirm that the prompt reverts to the initial state
                context.player1.clickCardInDisplayCardPrompt(context.aurraSingCrackshotSniper);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // progressively select 3 units with combined cost 7
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa],
                    selectable: [context.vanguardInfantry, context.battlefieldMarine, context.cartelTurncoat],
                    unselectable: [context.huntingNexu, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa, context.battlefieldMarine],
                    selectable: [context.vanguardInfantry, context.cartelTurncoat],
                    unselectable: [context.huntingNexu, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickCardInDisplayCardPrompt(context.vanguardInfantry);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa, context.battlefieldMarine, context.vanguardInfantry],
                    unselectable: [context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickPrompt('Play cards in selection order');
                expect([context.vanguardInfantry, context.wampa, context.battlefieldMarine]).toAllBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect([context.daringRaid, context.protector, context.huntingNexu, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper, context.cartelTurncoat])
                    .toAllBeInBottomOfDeck(context.player1, 7);
            });

            it('should allow the player to play only one card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);

                expect(context.player1).toHavePrompt('Choose up to 3 units with combined cost 7 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.battlefieldMarine],
                    selectable: [context.vanguardInfantry, context.cartelTurncoat, context.wampa, context.huntingNexu],
                    unselectable: [context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickPrompt('Play cards in selection order');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect([context.wampa, context.vanguardInfantry, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper, context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor])
                    .toAllBeInBottomOfDeck(context.player1, 9);
            });

            it('should allow the player to take nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);

                expect(context.player1).toHavePrompt('Choose up to 3 units with combined cost 7 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                    invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.cartelTurncoat, context.aurraSingCrackshotSniper, context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor])
                    .toAllBeInBottomOfDeck(context.player1, 10);
            });
        });

        it('U-Wing\'s ability should allow no more than 3 units to be played even if the total cost is less than 7', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['uwing-reinforcement'],
                    deck: [
                        'wampa',
                        'vanguard-infantry',
                        'battlefield-marine',
                        'criminal-muscle',
                        'cartel-turncoat',
                        'daring-raid',
                        'protector',
                        'strike-true',
                        'atat-suppressor',
                        'aurra-sing#crackshot-sniper',
                        'atst'
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.uwingReinforcement);

            expect(context.player1).toHavePrompt('Choose up to 3 units with combined cost 7 or less to play for free');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.criminalMuscle, context.cartelTurncoat, context.aurraSingCrackshotSniper],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.battlefieldMarine],
                selectable: [context.vanguardInfantry, context.cartelTurncoat, context.wampa, context.criminalMuscle],
                unselectable: [context.aurraSingCrackshotSniper],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            context.player1.clickCardInDisplayCardPrompt(context.vanguardInfantry);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.battlefieldMarine, context.vanguardInfantry],
                selectable: [context.cartelTurncoat, context.wampa, context.criminalMuscle],
                unselectable: [context.aurraSingCrackshotSniper],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            context.player1.clickCardInDisplayCardPrompt(context.cartelTurncoat);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.battlefieldMarine, context.vanguardInfantry, context.cartelTurncoat],
                selectable: [context.criminalMuscle],
                unselectable: [context.aurraSingCrackshotSniper, context.wampa],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            // click on a fourth card and confirm that nothing changes
            context.player1.clickCardInDisplayCardPrompt(context.criminalMuscle, true);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.battlefieldMarine, context.vanguardInfantry, context.cartelTurncoat],
                selectable: [context.criminalMuscle],
                unselectable: [context.aurraSingCrackshotSniper, context.wampa],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            // unselect and reselect battlefield marine to change the selection order
            context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.vanguardInfantry, context.cartelTurncoat],
                selectable: [context.criminalMuscle, context.battlefieldMarine, context.wampa],
                unselectable: [context.aurraSingCrackshotSniper],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            expect(context.player1).toHaveExactDisplayPromptCards({
                selected: [context.vanguardInfantry, context.cartelTurncoat, context.battlefieldMarine],
                selectable: [context.criminalMuscle],
                unselectable: [context.aurraSingCrackshotSniper, context.wampa],
                invalid: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor],
                usesSelectionOrder: true
            });
            expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

            context.player1.clickPrompt('Play cards in selection order');
            expect([context.battlefieldMarine, context.vanguardInfantry]).toAllBeInZone('groundArena');
            expect(context.cartelTurncoat).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect([context.daringRaid, context.protector, context.criminalMuscle, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper, context.wampa])
                .toAllBeInBottomOfDeck(context.player1, 7);
        });

        it('U-Wing\'s ability should play each card as a nested action (triggered abilities happen immediately)', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['uwing-reinforcement'],
                    groundArena: ['bossk#deadly-stalker'],
                    deck: [
                        'admiral-ackbar#brilliant-strategist',
                        'vanguard-ace',
                        'snowtrooper-lieutenant'
                    ],
                },
                player2: {
                    groundArena: ['wartime-trade-official']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.uwingReinforcement);

            expect(context.player1).toHavePrompt('Choose up to 3 units with combined cost 7 or less to play for free');
            context.player1.clickCardInDisplayCardPrompt(context.admiralAckbar);
            context.player1.clickCardInDisplayCardPrompt(context.snowtrooperLieutenant);
            context.player1.clickCardInDisplayCardPrompt(context.vanguardAce);
            context.player1.clickPrompt('Play cards in selection order');

            // Ackbar ability triggers and does 2 damage because it's the first unit played out
            expect(context.player1).toBeAbleToSelectExactly([context.wartimeTradeOfficial, context.admiralAckbar, context.bossk]);
            expect(context.admiralAckbar).toBeInZone('groundArena');
            expect(context.snowtrooperLieutenant).toBeInZone('deck');
            expect(context.vanguardAce).toBeInZone('deck');
            context.player1.clickCard(context.wartimeTradeOfficial);
            expect(context.wartimeTradeOfficial.damage).toBe(2);

            // Snowtrooper Lieutenant ability triggers
            expect(context.player1).toBeAbleToSelectExactly(context.bossk);
            expect(context.admiralAckbar).toBeInZone('groundArena');
            expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
            expect(context.vanguardAce).toBeInZone('deck');

            // Bossk attacks and defeats Wartime Trade Official. its on-defeat ability triggers immediately since it's nested as well
            context.player1.clickCard(context.bossk);
            context.player1.clickCard(context.wartimeTradeOfficial);
            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);

            // Bossk ability triggers after all when played abilities (including Vanguard Ace)
            expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.admiralAckbar, context.snowtrooperLieutenant, context.vanguardAce, battleDroids[0]]);
            expect(context.admiralAckbar).toBeInZone('groundArena');
            expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
            expect(context.vanguardAce).toBeInZone('spaceArena');

            // Vanguard Ace gets three experience since three other cards were previously played (including U-Wing itself)
            expect(context.vanguardAce).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);

            context.player1.clickCard(context.admiralAckbar);
            expect(context.admiralAckbar.damage).toBe(2);
        });
    });
});
