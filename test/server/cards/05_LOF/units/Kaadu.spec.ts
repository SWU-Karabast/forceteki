describe('Kaadu', function() {
    integration(function(contextRef) {
        describe('Kaadu\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kaadu'],
                        groundArena: ['gamorrean-guards'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: { card: 'echo-base', damage: 12 },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['patrolling-vwing'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should give its own ground unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kaadu);
                expect(context.player1).toBeAbleToSelectExactly([context.gamorreanGuards, context.cartelSpacer]);
                context.player1.clickCard(context.gamorreanGuards);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.gamorreanGuards);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should give friendly space unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kaadu);
                expect(context.player1).toBeAbleToSelectExactly([context.gamorreanGuards, context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.patrollingVwing);
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});