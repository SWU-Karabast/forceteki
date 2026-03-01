describe('4-LOM, Devious', function() {
    integration(function(contextRef) {
        it('4-LOM\'s ability when played ability should initiate attack with an Underworld unit even if it\'s exhausted (cannot attack base)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['4lom#devious'],
                    groundArena: [{ card: 'boba-fett#disintegrator', exhausted: true }, 'bossk#deadly-stalker', 'wampa']
                },
                player2: {
                    groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context._4lom);
            expect(context.player1).toBeAbleToSelectExactly([context._4lom, context.bobaFett, context.bossk]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.bobaFett);

            expect(context.player1).toBeAbleToSelectExactly([context.bailOrganaRebelCouncilor, context.sundariPeacekeeper]);
            expect(context.player1).toHavePassAttackButton();
            context.player1.clickCard(context.sundariPeacekeeper);

            expect(context.sundariPeacekeeper.damage).toBe(3);
            expect(context.bobaFett.exhausted).toBe(true);
            expect(context.bobaFett.damage).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
