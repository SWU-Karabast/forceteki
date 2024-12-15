describe('501st-liberator', function() {
    integration(function(contextRef) {
        it('501st-liberator\'s when played ability should restore 3 from base, if a friendly republic unit is in play', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['mace-windu#party-crasher'],
                    hand: ['501st-liberator'],
                    base: { card: 'echo-base', damage: 12 }
                },
                player2: {
                    groundArena: ['admiral-yularen#advising-caution'],
                    base: { card: 'echo-base', damage: 3 }
                }
            });

            const { context } = contextRef;

            // playing 501st with another republic unit on field, heals for 3 on own base
            expect(context.p1Base.damage).toBe(12);
            context.player1.clickCard(context._501stLiberator);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(9);

            context.player2.passAction();
            context.player1.moveCard(context._501stLiberator, 'hand');

            // playing 501st with another republic unit on field, heals for 3 on opponent base
            expect(context.p2Base.damage).toBe(3);
            context.player1.clickCard(context._501stLiberator);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(0);

            // playing 501st with another republic unit on opponents field, doesnt trigger.
            context.player1.moveCard(context.maceWindu, 'discard');
            context.player1.moveCard(context._501stLiberator, 'hand');
            context.player2.passAction();
            context.player1.clickCard(context._501stLiberator);
            expect(context.p1Base.damage).toBe(9);
        });
    });
});