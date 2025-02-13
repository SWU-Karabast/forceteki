describe('Red Three', function () {
    integration(function (contextRef) {
        describe('Red Three\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper', 'bail-organa#rebel-councilor', 'battlefield-marine'],
                        spaceArena: ['red-three#unstoppable', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    }
                });
            });

            it('should give Raid 1 to heroism unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.ruggedSurvivors, context.cargoJuggernaut]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                // should not give Raid 1 to non-heroism unit
                context.player2.passAction();
                context.setDamage(context.p2Base, 0);
                context.player1.clickCard(context.deathTrooper);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.ruggedSurvivors, context.cargoJuggernaut]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // red three should not give raid 1 to itself
                context.setDamage(context.p2Base, 0);
                context.player2.passAction();
                context.player1.clickCard(context.redThree);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
