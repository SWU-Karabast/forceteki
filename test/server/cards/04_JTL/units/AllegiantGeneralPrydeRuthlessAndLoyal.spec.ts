describe('Allegiant General Pryde, Ruthless and Loyal', function () {
    integration(function (contextRef) {
        describe('Allegiant General Pryde\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['allegiant-general-pryde#ruthless-and-loyal', 'wampa'],
                        hasInitiative: true,
                    },
                    player2: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['devotion', 'shield', 'the-darksaber']
                        }, 'crafty-smuggler']
                    }
                });
            });

            it('should deal 2 indirect damage if we have initiative', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allegiantGeneralPryde);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Opponent');

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 2],
                ]));

                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal 2 indirect damage if we do not have initiative', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.player2.claimInitiative();

                context.player1.clickCard(context.allegiantGeneralPryde);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an non-unique upgrade on unit when indirect damage is dealt to it', function () {
                const { context } = contextRef;

                context.allegiantGeneralPryde.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.allegiantGeneralPryde);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Opponent');

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.craftySmuggler, 1],
                    [context.battlefieldMarine, 1],
                ]));

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Defeat a non-unique upgrade on the unit: Battlefield Marine',
                    'Defeat a non-unique upgrade on the unit: Crafty Smuggler'
                ]);

                context.player1.clickPrompt('Defeat a non-unique upgrade on the unit: Battlefield Marine');

                expect(context.player1).toBeAbleToSelectExactly([context.devotion, context.shield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.devotion);

                expect(context.player2).toBeActivePlayer();
                expect(context.devotion).toBeInZone('discard');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield', 'the-darksaber']);
            });
        });
    });
});
