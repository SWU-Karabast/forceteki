describe('Honor-Bound Partisan', function() {
    integration(function(contextRef) {
        describe('Honor-Bound Partisans\'s abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['honorbound-partisan', 'battlefield-marine', 'daring-raid'],
                        leader: 'han-solo#worth-the-risk',
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        hand: ['distant-patroller', 'takedown', 'no-glory-only-results'],
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        base: 'sundari'
                    },
                });
            });

            it('should deal 1 damage to its own base when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.honorboundPartisan);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to enemy base when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.honorboundPartisan);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should discount the next unit played when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.honorboundPartisan);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.honorboundPartisan);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should not discount non units when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.honorboundPartisan);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.honorboundPartisan);

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should work with NGOR', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.honorboundPartisan);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.honorboundPartisan);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.clickCard(context.distantPatroller);
                expect(context.player2.exhaustedResourceCount).toBe(6);
            });
        });
    });
});