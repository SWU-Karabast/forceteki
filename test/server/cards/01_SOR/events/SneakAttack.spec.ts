describe('Sneak Attack', function() {
    integration(function(contextRef) {
        it('Sneak Attack ability\'s should play Sabine for 1 resource less and defeat it at the end.', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'obiwan-kenobi#following-fate'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    base: { card: 'administrators-tower', damage: 0 },
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: false },
                    resources: 3
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sneakAttack);
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren]);
            context.player1.clickCard(context.sabineWren);
            expect(context.sabineWren.exhausted).toBeFalse();
            expect(context.player1.readyResourceCount).toBe(0);

            // Check that Sabine is defeated at the beginning of the regroup phase
            context.moveToRegroupPhase();
            expect(context.sabineWren).toBeInZone('discard');
            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
        });
    });
});