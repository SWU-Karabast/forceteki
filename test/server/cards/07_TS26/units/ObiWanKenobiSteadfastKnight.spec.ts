describe('Obi-Wan Kenobi, Steadfast Knight', function() {
    integration(function(contextRef) {
        describe('Obi-Wan Kenobi\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['obiwan-kenobi#steadfast-knight', 'echo#valiant-arc-trooper'],
                        spaceArena: ['awing'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['jesse#hardfighting-patriot'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
            });

            it('should not add Restore 1 to himself', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should add Restore 1 to other friendly Republic units', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.echo);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should not affect non-Republic units', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should not affect enemy Republic units', function() {
                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.jesse);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
