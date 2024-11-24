describe('Reckless Gunslinger', function () {
    integration(function (contextRef) {
        describe('Reckless Gunslinger\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-gunslinger']
                    },
                    player2: {}
                });
            });

            it('should deal 1 damage to each base.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.recklessGunslinger);
                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
