describe('Green Leader, Crynyd\'s Sacrifice', function () {
    integration(function (contextRef) {
        it('Green Leader\'s ability should allow dealing 2 damage to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-leader#crynyds-sacrifice'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['atst'],
                    spaceArena: ['tie-bomber'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.greenLeader);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieBomber]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
        });

        it('Green Leader\'s ability should allow dealing 2 damage to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-leader#crynyds-sacrifice'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['tie-bomber'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.greenLeader);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieBomber]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
        });
    });
});
