describe('Wedge Antilles, Star of the Rebellion', function() {
    integration(function(contextRef) {
        describe('Wedge Antilles\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'battlefield-marine', 'clan-saxon-gauntlet'],
                        groundArena: ['wedge-antilles#star-of-the-rebellion'],
                        leader: 'hera-syndulla#spectre-two',
                        resources: 30
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['hwk290-freighter'],
                        hand: ['atst']
                    }
                });
            });

            it('should give Ambush and +1/+1 to a friendly VEHICLE unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceXwing);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);
                context.player1.clickPrompt('Ambush');


                expect(context.allianceXwing.exhausted).toBeTrue();
                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.hwk290Freighter.damage).toBe(3);
            });

            it('should not give Ambush and +1/+1 to a friendly non-VEHICLE unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInLocation('ground arena');
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should not give Ambush and +1/+1 to a enemy VEHICLE unit', function () {
                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.atst);
                expect(context.atst).toBeInLocation('ground arena');
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });
        });
    });
});
