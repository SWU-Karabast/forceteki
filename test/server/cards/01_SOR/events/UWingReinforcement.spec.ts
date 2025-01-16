describe('U-Wing Reinforcement', function() {
    integration(function(contextRef) {
        describe('U-Wing\'s ability', function() {
            it('should deal damage to an enemy unit equals to a friendly unit power', function () {
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
                            'partisan-insurgent',
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
                    selectable: [context.wampa, context.vanguardInfantry, context.battlefieldMarine, context.huntingNexu, context.partisanInsurgent, context.aurraSingCrackshotSniper],
                    unselectable: [context.daringRaid, context.protector, context.strikeTrue, context.atatSuppressor]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa],
                    selectable: [context.vanguardInfantry, context.battlefieldMarine, context.partisanInsurgent],
                    unselectable: [context.daringRaid, context.protector, context.huntingNexu, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa, context.battlefieldMarine],
                    selectable: [context.vanguardInfantry],
                    unselectable: [context.daringRaid, context.protector, context.huntingNexu, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper, context.partisanInsurgent]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.vanguardInfantry);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa, context.battlefieldMarine, context.vanguardInfantry],
                    unselectable: [context.daringRaid, context.protector, context.huntingNexu, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper, context.partisanInsurgent]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect([context.vanguardInfantry, context.wampa, context.battlefieldMarine]).toAllBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect([context.daringRaid, context.protector, context.huntingNexu, context.strikeTrue, context.atatSuppressor, context.aurraSingCrackshotSniper, context.partisanInsurgent])
                    .toAllBeInBottomOfDeck(context.player1, 7);
            });
        });
    });
});
