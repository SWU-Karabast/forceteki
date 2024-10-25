describe('Wedge Antilles, Star of the Rebellion', function() {
    integration(function(contextRef) {
        describe('Wedge Antilles\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'battlefield-marine'],
                        groundArena: ['wedge-antilles#star-of-the-rebellion'],
                    },
                    player2: {
                        spaceArena: ['hwk290-freighter'],
                        hand: ['atst']
                    }
                });
            });

            it('should give Ambush and +1/+1 to a friendly Vehicle unit', function () {
                const { context } = contextRef;

                // Case 1: It should give Ambush and +1/+1 to a friendly Vehicle unit.
                context.player1.clickCard(context.allianceXwing);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);
                context.player1.clickPrompt('Ambush');

                expect(context.allianceXwing.exhausted).toBeTrue();
                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.hwk290Freighter.damage).toBe(3);

                // Case 2: It should not give Ambush and +1/+1 to an enemy Vehicle unit
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeInLocation('ground arena');
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.player1).toBeActivePlayer();

                // Case 3: It should not give Ambush and +1/+1 to a friendly non-Vehicle unit
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInLocation('ground arena');
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
