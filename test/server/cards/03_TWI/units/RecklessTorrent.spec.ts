describe('Reckless Torrent', function() {
    integration(function(contextRef) {
        describe('Reckless Torrent\'s when played Coordinate ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['wing-leader'],
                        hand: ['reckless-torrent']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 2 damage to a friendly unit and 2 damage to an enemy unit in the same arena (ground)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recklessTorrent);
                expect(context.player1).toBeAbleToSelectExactly([context.recklessTorrent, context.battlefieldMarine, context.wingLeader]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.atst.damage).toBe(2);
            });

            it('should deal 2 damage to a friendly unit and 2 damage to an enemy unit in the same arena (space)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recklessTorrent);
                expect(context.player1).toBeAbleToSelectExactly([context.recklessTorrent, context.battlefieldMarine, context.wingLeader]);

                context.player1.clickCard(context.recklessTorrent);
                // Cartel Spacer is automatically selected

                expect(context.recklessTorrent).toBeInZone('discard');
                expect(context.cartelSpacer.damage).toBe(2);
            });
        });

        it('should do nothing if the Coordinate condition is not met', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    hand: ['reckless-torrent']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.recklessTorrent);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
