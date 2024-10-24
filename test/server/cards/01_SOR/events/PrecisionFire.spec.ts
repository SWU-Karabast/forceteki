describe('Precision Fire', function () {
    integration(function (contextRef) {
        describe('Precision Fire\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['precision-fire'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['echo-base-defender'],
                        spaceArena: ['corellian-freighter']
                    }
                });
            });

            it('should initiate 1 with saboteur and +2/+0 because unit is trooper', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.precisionFire);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);

                // choose a trooper unit
                context.player1.clickCard(context.battlefieldMarine);

                // saboteur: we ignore sentinel
                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5); // 3+2 (because battlefield marine is a trooper)

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should initiate 1 attack with saboteur and not +2/+0 because unit is not trooper', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.precisionFire);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);

                // do not choose a trooper unit
                context.player1.clickCard(context.allianceXwing);

                // saboteur: we ignore sentinel
                expect(context.player1).toBeAbleToSelectExactly([context.corellianFreighter, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
                expect(context.allianceXwing.getPower()).toBe(2);
            });
        });
    });
});
