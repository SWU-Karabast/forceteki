describe('SpecForce Soldier', function () {
    integration(function (contextRef) {
        describe('SpecForce Soldier\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['battlefield-marine', 'echo-base-defender'],
                    },
                    player2: {
                        groundArena: ['academy-defense-walker'],
                    }
                });
            });

            it('should give an Experience to all damaged friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.specforceSoldier);

                // select any unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.specforceSoldier, context.echoBaseDefender, context.academyDefenseWalker]);
                context.player1.clickCard(context.academyDefenseWalker);
                context.player2.passAction();

                // attack base
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.academyDefenseWalker]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                context.moveToNextActionPhase();

                // next action phase, academy defense walker is now Sentinel
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.academyDefenseWalker.damage).toBe(3);
            });
        });
    });
});
