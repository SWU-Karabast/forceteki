describe('Homestead Militia', function () {
    integration(function (contextRef) {
        describe('Homestead Militia\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'battlefield-marine'],
                        groundArena: ['homestead-militia'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut', 'atst']
                    }
                });
            });

            it('should not gain Sentinel with 6 or more resources', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.cargoJuggernaut);
                // no sentinel, I can attack base
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.homesteadMilitia]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);

                context.player1.moveCard(context.wampa, 'resource');
                context.player1.passAction();

                context.player2.clickCard(context.ruggedSurvivors);
                // homestead militia automatically selected because of Sentinel
                expect(context.player1).toBeActivePlayer();
                expect(context.homesteadMilitia.damage).toBe(3);

                // remove resource and check if homestead militia lost sentinel
                context.player1.moveCard(context.wampa, 'hand', 'resource');
                context.player1.passAction();
                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.homesteadMilitia]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(10);
            });
        });
    });
});
