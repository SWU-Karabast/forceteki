describe('N-1 Patroller', function() {
    integration(function(contextRef) {
        describe('N-1 Patroller\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['n1-patroller'],
                        groundArena: ['wampa', { card: 'hired-slicer', damage: 3 }],
                        leader: { card: 'cal-kestis#i-cant-keep-hiding', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.n1Patroller);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.hiredSlicer]);
                context.player1.clickPrompt('Pass');

                expect(context.n1Patroller).toBeInZone('spaceArena');
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.awing).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.calKestis).toBeInZone('groundArena');
                expect(context.hiredSlicer).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to defeat a friendly unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.n1Patroller);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.hiredSlicer]);
                context.player1.clickCard(context.hiredSlicer);

                expect(context.n1Patroller).toBeInZone('spaceArena');
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.awing).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.calKestis).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');

                expect(context.hiredSlicer).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to defeat an enemy unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.n1Patroller);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.hiredSlicer]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.n1Patroller).toBeInZone('spaceArena');
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.awing).toBeInZone('spaceArena');
                expect(context.hiredSlicer).toBeInZone('groundArena');
                expect(context.calKestis).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');

                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});