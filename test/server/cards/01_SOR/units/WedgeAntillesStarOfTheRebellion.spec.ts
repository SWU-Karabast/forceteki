describe('Wedge Antilles, Star of the Rebellion', function() {
    integration(function(contextRef) {
        describe('Wedge Antilles\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'battlefield-marine', 'veteran-fleet-officer'],
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

                context.player1.clickCard(context.allianceXwing);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.hwk290Freighter);

                expect(context.allianceXwing.exhausted).toBeTrue();
                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.hwk290Freighter.damage).toBe(3);
            });

            it('should not give Ambush and +1/+1 to an enemy Vehicle unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not give Ambush and +1/+1 to a friendly non-Vehicle unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give Ambush and +1/+1 to friendly token Vehicle units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.veteranFleetOfficer);

                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.hwk290Freighter);

                const xwing = context.player1.findCardByName('xwing');

                expect(xwing.exhausted).toBeTrue();
                expect(xwing.getPower()).toBe(3);
                expect(xwing.getHp()).toBe(3);
                expect(xwing.damage).toBe(2);
                expect(context.hwk290Freighter.damage).toBe(3);
            });
        });
    });
});
