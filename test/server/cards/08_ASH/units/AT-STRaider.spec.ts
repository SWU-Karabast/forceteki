describe('AT-ST Raider', function() {
    integration(function(contextRef) {
        describe('AT-ST Raider\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atst-raider'],
                        spaceArena: ['patrolling-vwing'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    },
                });
            });

            it('should have Ambush while controlling a non-unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atstRaider);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);

                // ambush grogu
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.grogu);
                expect(context.atstRaider.exhausted).toBeTrue();
                expect(context.atstRaider.damage).toBe(0);
                expect(context.grogu.damage).toBe(4);
            });
        });

        describe('AT-ST Raider\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atst-raider'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible', 'battlefield-marine'],
                    },
                });
            });

            it('should not have Ambush while we are not controlling a non-unique unit and the opponent is', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.atstRaider);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});