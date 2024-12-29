describe('Count Dooku, Fallen Jedi', function() {
    integration(function(contextRef) {
        it('Count Dooku\'s when played ability should do damage to enemy units per unit exploited when playing him', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['count-dooku#fallen-jedi'],
                    groundArena: ['wampa', 'battle-droid'],
                    spaceArena: ['tie-advanced']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.countDookuFallenJedi);
            context.player1.clickPrompt('Play Count Dooku using Exploit');

            // choose exploit targets
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battleDroid);
            context.player1.clickPrompt('Done');

            // choose first damage target (from wampa)
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
            // click needs to be non-checking b/c prompt remains unchanged
            context.player1.clickCardNonChecking(context.atst);
            expect(context.atst.damage).toBe(4);

            // choose second damage target (from battle droid)
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
            context.player1.clickCard(context.cartelSpacer);
            expect(context.cartelSpacer.damage).toBe(1);
        });
    });
});
