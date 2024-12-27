describe('501st Liberator', function() {
    integration(function(contextRef) {
        it('501st Liberator\'s when played ability should restore 3 from base, if a friendly republic unit is in play', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['mace-windu#party-crasher'],
                    hand: ['501st-liberator'],
                    base: { card: 'echo-base', damage: 12 }
                },
                player2: {
                    groundArena: ['admiral-yularen#advising-caution'],
                    base: { card: 'echo-base', damage: 3 },
                    hand: ['waylay', 'rivals-fall']
                }
            });

            const { context } = contextRef;

            // playing 501st with another republic unit on field, heals for 3 on own base
            expect(context.p1Base.damage).toBe(12);
            context.player1.clickCard(context._501stLiberator);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(9);

            // prepare for next test
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context._501stLiberator);
            context.player1.passAction();
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.maceWindu);

            // playing 501st with another republic unit on opponents field, doesnt trigger.
            context.player1.clickCard(context._501stLiberator);
            expect(context.p1Base.damage).toBe(9);
        });
    });
});