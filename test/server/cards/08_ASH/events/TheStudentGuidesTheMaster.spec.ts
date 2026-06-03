describe('The Student Guides the Master', function () {
    integration(function (contextRef) {
        describe('The Student Guides the Master\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-student-guides-the-master'],
                        groundArena: ['porg', 'wampa', 'atst'],
                        spaceArena: ['tie-bomber']
                    },
                    player2: {
                        groundArena: ['yoda#old-master', 'battlefield-marine'],
                    }
                });
            });

            it('should give +1/+0 for each other friendly unit with less power (only 1 unit with less power)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theStudentGuidesTheMaster);
                expect(context.player1).toBeAbleToSelectExactly([context.tieBomber, context.porg, context.wampa, context.atst]);
                context.player1.clickCard(context.porg);

                expect(context.porg.getPower()).toBe(2);
                expect(context.porg.getHp()).toBe(1);

                context.moveToNextActionPhase();

                expect(context.porg.getPower()).toBe(1);
                expect(context.porg.getHp()).toBe(1);
            });

            it('should give +1/+0 for each other friendly unit with less power (2 units with less power, should not count enemy units)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theStudentGuidesTheMaster);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should give +1/+0 for each other friendly unit with less power (3 units with less power)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theStudentGuidesTheMaster);
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(9);
                expect(context.atst.getHp()).toBe(7);
            });

            it('should give +1/+0 for each other friendly unit with less power (no unit with less power)', function () {
                const { context } = contextRef;

                // play The Student Guides the Master
                context.player1.clickCard(context.theStudentGuidesTheMaster);
                context.player1.clickCard(context.tieBomber);

                expect(context.tieBomber.getPower()).toBe(0);
                expect(context.tieBomber.getHp()).toBe(4);
            });
        });
    });
});
