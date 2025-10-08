describe('Valiant Commando', function() {
    integration(function(contextRef) {
        it('Valiant Commando\'s ability may defeat him to deal 3 damage to the damaged base (when he deals combat damage to a base)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['valiant-commando'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.valiantCommando);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Defeat this unit. If you do, deal 3 damage to the damaged base');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.valiantCommando).toBeInZone('discard', context.player1);
            expect(context.p2Base.damage).toBe(6);
        });

        it('Valiant Commando\'s ability should does nothing when a friendly unit deals combat damage to base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['valiant-commando', 'yoda#old-master'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.valiantCommando).toBeInZone('groundArena', context.player1);
        });

        it('Valiant Commando\'s ability may defeat him to deal 3 damage to the damaged base (when he deals combat damage to a base) (overwhelm)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['valiant-commando', 'clone-commander-cody#commanding-the-212th'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['jedha-agitator']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.valiantCommando);
            context.player1.clickCard(context.jedhaAgitator);

            expect(context.player1).toHavePassAbilityPrompt('Defeat this unit. If you do, deal 3 damage to the damaged base');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.valiantCommando).toBeInZone('discard', context.player1);
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
