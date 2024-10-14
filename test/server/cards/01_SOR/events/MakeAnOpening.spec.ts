describe('Make an Opening', function () {
    integration(function () {
        describe('Make an Opening\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                        groundArena: ['pyke-sentinel', 'atst'],
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should reduce hp to a enemy unit and heal your base', function () {
                const { context } = contextRef;

                context.p1Base.damage = 5;
                context.player1.clickCard(context.makeAnOpening);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.sabineWren]);

                context.player1.clickCard(context.isbAgent);
                expect(context.isbAgent.getPower()).toBe(0);
                expect(context.isbAgent.remainingHp).toBe(1);

                expect(context.p1Base.damage).toBe(3);
            });

            it('should reduce hp to an ally unit and heal your base', function () {
                const { context } = contextRef;

                context.p1Base.damage = 5;
                context.player1.clickCard(context.makeAnOpening);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.sabineWren]);

                context.player1.clickCard(context.atst);
                expect(context.atst.getPower()).toBe(4);
                expect(context.atst.remainingHp).toBe(5);

                expect(context.p1Base.damage).toBe(3);
            });
        });
    });
});
