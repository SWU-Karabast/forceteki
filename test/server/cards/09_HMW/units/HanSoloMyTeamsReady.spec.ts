describe('Han Solo, My Team\'s Ready', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['han-solo#my-teams-ready', 'wampa', { card: 'atst', exhausted: true }],
                        spaceArena: [{ card: 'awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'porg', exhausted: true }],
                    }
                });
            });

            it('should exhaust self to ready another unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveEnabledPromptButtons(['Cancel', 'Attack', 'Ready another unit']);
                context.player1.clickPrompt('Ready another unit');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing, context.porg]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.awing.exhausted).toBeFalse();
            });

            it('can select a ready unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveEnabledPromptButtons(['Cancel', 'Attack', 'Ready another unit']);
                context.player1.clickPrompt('Ready another unit');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing, context.porg]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });
        });
    });
});
