describe('Specific Clone scenarios', function() {
    integration(function(contextRef) {
        describe('When Clone copies LOF Yoda and is played with Ambush', function() {
            it('should be able to trigger Yoda\'s damage ability 2 times', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force'],
                        hand: ['timely-intervention', 'clone'],
                        base: { card: 'jedi-temple', damage: 5 }
                    },
                    player2: {
                        groundArena: [
                            'knight-of-ren',
                            'knight-of-ren',
                            'knight-of-ren'
                        ]
                    }
                });

                const { context } = contextRef;
                const [knight1, knight2, knight3] = context.player2.findCardsByName('knight-of-ren');

                // Play Timely Intervention to play Clone with Ambush
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.yoda);
                expect(context.clone).toBeCloneOf(context.yoda);

                // Choose to resolve When Played ability first
                context.player1.clickPrompt('Use the Force to heal 5 damage from a base');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);

                // Nested triggers: Resolve each of the two When You Use the Force abilities
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'When you use the Force',
                    'When you use the Force'
                ]);
                context.player1.clickPrompt('When you use the Force');
                expect(context.player1).toHavePrompt('Choose a unit to deal 4 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.yoda,
                    context.clone,
                    knight1,
                    knight2,
                    knight3
                ]);
                context.player1.clickCard(knight1);
                expect(knight1).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Choose a unit to deal 4 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.yoda,
                    context.clone,
                    knight2,
                    knight3
                ]);
                context.player1.clickCard(knight2);
                expect(knight2).toBeInZone('discard');

                // Now resolve the ambush
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(knight3);
                expect(knight3).toBeInZone('discard');
            });
        });
    });
});