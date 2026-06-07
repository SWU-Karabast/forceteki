describe('Barriss Offee, Redeeming Herself', function() {
    integration(function(contextRef) {
        describe('Barriss Offee\'s when played ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['barriss-offee#redeeming-herself'],
                        groundArena: [{ card: 'wampa', damage: 3 }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }]
                    }
                });
            });

            it('heals up to 2 damage from a unit and gives one Advantage token for each damage healed', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffeeRedeemingHerself);
                expect(context.player1).toHavePrompt('Distribute 2 healing to 1 target');
                expect(context.player1).toBeAbleToSelectExactly([context.barrissOffeeRedeemingHerself, context.wampa, context.atst]);

                context.player1.setDistributeHealingPromptState(new Map([
                    [context.wampa, 2]
                ]));

                expect(context.wampa.damage).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage']);
            });

            it('gives only one Advantage token when only 1 damage is healed', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffeeRedeemingHerself);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.atst, 1]
                ]));

                expect(context.atst.damage).toBe(0);
                expect(context.atst).toHaveExactUpgradeNames(['advantage']);
            });

            it('does not give an Advantage token when 0 damage is healed from a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffeeRedeemingHerself);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.barrissOffeeRedeemingHerself, 1]
                ]));

                expect(context.barrissOffeeRedeemingHerself.damage).toBe(0);
                expect(context.barrissOffeeRedeemingHerself).toHaveExactUpgradeNames([]);
            });
        });
    });
});
