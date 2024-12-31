describe('Ability resolver', function() {
    integration(function(contextRef) {
        it('Triggers during an "if you do" sub-step for an event ability should go in the same resolution window as triggers from the beginning of the ability', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['selfdestruct'],
                    spaceArena: ['star-wing-scout', 'rhokai-gunship']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.selfdestruct);
            context.player1.clickCard(context.starWingScout);
            expect(context.starWingScout).toBeInZone('discard');
            context.player1.clickCard(context.rhokaiGunship);
            expect(context.rhokaiGunship).toBeInZone('discard');

            // confirm that both prompts appear in the same window after the whole ability resolves
            expect(context.player1).toHaveExactPromptButtons([
                'Draw 2 cards',
                'Deal 1 damage to a unit or base'
            ]);

            context.player1.clickPrompt('Deal 1 damage to a unit or base');
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(1);

            // draw ability resolves automatically
            expect(context.player1.handSize).toBe(2);
        });
    });
});
