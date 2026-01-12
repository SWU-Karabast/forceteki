describe('Hera Syndulla, Not Fighting Alone', function() {
    integration(function(contextRef) {
        describe('Hera Syndulla\'s leader ability (undeployed)', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa', 'yoda#old-master', 'atst'],
                        groundArena: ['rebel-pathfinder', 'fleet-lieutenant'],
                        leader: 'hera-syndulla#not-fighting-alone',
                        base: 'echo-base'
                    },
                    player2: {
                        hand: ['battlefield-marine'],
                        groundArena: ['wookiee-warrior', 'warrior-drone'],
                        leader: 'rio-durant#wisecracking-wheelman',
                        base: 'echo-base'
                    }
                });
            });

            it('should ignore aspect penalties for Heroism cards when there are 2 or more arena units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.yoda);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should not ignore aspect penalties for non-Heroism cards even when there are 2 or more arena units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not ignore aspect penalties for opponent cards', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2.exhaustedResourceCount).toBe(4);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not ignore aspect penalties for Villainy cards', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });
        });
        it('should not ignore aspect penalties for Heroism cards when there are fewer than 2 arena units (undeployed)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#explosives-artist'],
                    groundArena: ['rebel-pathfinder'],
                    leader: 'hera-syndulla#not-fighting-alone',
                    base: 'echo-base'
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        describe('Hera Syndulla\'s leader ability (deployed)', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa', 'yoda#old-master', 'atst'],
                        groundArena: ['rebel-pathfinder', 'fleet-lieutenant'],
                        leader: { card: 'hera-syndulla#not-fighting-alone', deployed: true },
                        base: 'echo-base'
                    },
                    player2: {
                        hand: ['battlefield-marine'],
                        groundArena: ['wookiee-warrior', 'warrior-drone'],
                        leader: 'rio-durant#wisecracking-wheelman',
                        base: 'echo-base'
                    }
                });
            });

            it('should ignore aspect penalties for Heroism cards when there are 2 or more arena units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.yoda);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should not ignore aspect penalties for non-Heroism cards even when there are 2 or more arena units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not ignore aspect penalties for opponent cards', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2.exhaustedResourceCount).toBe(4);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not ignore aspect penalties for Villainy cards', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });
        });
        it('should not ignore aspect penalties for Heroism cards when there are fewer than 2 arena units (deployed)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#explosives-artist'],
                    leader: { card: 'hera-syndulla#not-fighting-alone', deployed: true },
                    base: 'echo-base'
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });
    });
});
