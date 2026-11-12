describe('Onyx Squadron Brute', function() {
    integration(function(contextRef) {
        it('Onyx Squadron Brute\'s when defeated ability should heal 2 damage from a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['onyx-squadron-brute'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(3);

            // Trigger the defeat ability
            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.onyxSquadronBrute);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Heal 2 damage from a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(1);
        });

        it('Onyx Squadron Brute\'s when defeated ability should be resolved by the new controller when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['onyx-squadron-brute'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    base: { card: 'echo-base', damage: 3 },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.onyxSquadronBrute);

            // player2 controlled Onyx Squadron Brute when it was defeated, so player2 chooses the base
            expect(context.player2).toHavePrompt('Heal 2 damage from a base');
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player2.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);
            expect(context.p1Base.damage).toBe(3);
            expect(context.onyxSquadronBrute).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
