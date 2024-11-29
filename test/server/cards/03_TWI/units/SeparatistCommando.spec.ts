describe('Separatist Commando', function () {
    integration(function (contextRef) {
        describe('Separatist Commando\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['separatist-commando', 'wartime-trade-official']
                    },
                    player2: {}
                });
            });

            it('should have Raid 2 as we control a Separatist unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.separatistCommando);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('Separatist Commando\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['separatist-commando']
                    },
                    player2: {
                        groundArena: ['wartime-trade-official']
                    }
                });
            });

            it('should not have Raid 2 as we do not control a Separatist unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
