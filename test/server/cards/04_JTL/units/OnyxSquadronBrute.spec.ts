describe('Onyx Squadron Brute', function() {
    integration(function(contextRef) {
        it('Onyx Squadron Brute\'s when defeated ability should heal 2 damage from a base', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['onyx-squadron-brute'],
                    base: { card: 'chopper-base', damage: 2 },
                },
                player2: {
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(2);

            // Trigger the defeat ability
            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.onyxSquadronBrute);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Choose a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(0);
        });
    });
});
