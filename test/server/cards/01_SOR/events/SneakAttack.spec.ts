describe('Sneak Attack', function() {
    integration(function(contextRef) {
        describe('Sneak Attack\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'obiwan-kenobi#following-fate', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: 'administrators-tower',
                        leader: 'luke-skywalker#faithful-friend',
                        resources: 3
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
            });

            it('should play Sabine for 1 resource less and defeat it at the end.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.obiwanKenobi]);
                context.player1.clickCard(context.sabineWren);
                expect(context.sabineWren.exhausted).toBeFalse();
                expect(context.player1.readyResourceCount).toBe(0);

                // Check that Sabine is defeated at the beginning of the regroup phase
                context.moveToRegroupPhase();
                expect(context.sabineWren).toBeInZone('discard');
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('should not play Obi-Wan because not enough resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.obiwanKenobi]);
                context.player1.clickCard(context.obiwanKenobi);
                expect(context.obiwanKenobi).toBeInZone('hand');
                expect(context.sabineWren).toBeInZone('hand');
                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not bug if Sabine is defeated before the end of the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.sabineWren);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.sabineWren);
                expect(context.sabineWren).toBeInZone('discard');
            });
        });
    });
});
