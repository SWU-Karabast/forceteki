describe('FN Trooper Corps', function() {
    integration(function(contextRef) {
        it('should, when played, give an Experience token to another friendly unit (not itself)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fn-trooper-corps'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play FN Trooper Corps from hand
            context.player1.clickCard(context.fnTrooperCorps);

            // It should prompt to select another friendly unit (cannot target itself or enemy units)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toBeAbleToSelect(context.fnTrooperCorps);
            expect(context.player1).not.toBeAbleToSelect(context.wampa);

            // Choose the friendly unit
            context.player1.clickCard(context.battlefieldMarine);

            // The chosen unit should have received an Experience token
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
        });

        it('should, when played with Plot, give an Experience token to another friendly unit (not itself)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hondo-ohnaka#thats-good-business',
                    resources: ['fn-trooper-corps', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hondoOhnaka);
            context.player1.clickPrompt('Deploy Hondo Ohnaka');

            expect(context.player1).toHavePassAbilityPrompt('Play FN Trooper Corps using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.hondoOhnaka]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toBeAbleToSelect(context.fnTrooperCorps);
            expect(context.player1).not.toBeAbleToSelect(context.battlefieldMarine);

            context.player1.clickCard(context.awing);

            expect(context.awing).toHaveExactUpgradeNames(['experience']);
        });
    });
});
