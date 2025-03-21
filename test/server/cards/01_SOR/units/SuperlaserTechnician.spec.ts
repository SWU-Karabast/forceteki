describe('Superlaser Technician', function () {
    integration(function (contextRef) {
        it('Superlaser Technician\'s ability should allow the controller to put the defeated Technician into play as a resource and ready it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['superlaser-technician']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.sundariPeacekeeper);

            const readyResourcesBeforeTrigger = context.player1.readyResourceCount;
            expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
            context.player1.clickPrompt('Trigger');

            expect(context.player1.readyResourceCount).toBe(readyResourcesBeforeTrigger + 1);
            expect(context.superlaserTechnician).toBeInZone('resource');
            expect(context.superlaserTechnician.exhausted).toBe(false);
            expect(context.player2).toBeActivePlayer();
        });

        // TODO FIX MULTIPLE TRIGGER WHICH PLAY THE SAME CARD
        // it('Superlaser Technician\'s ability should allow the controller to put the defeated Technician into play as a resource and ready it', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['swoop-down'],
        //             spaceArena: ['arquitens-assault-cruiser']
        //         },
        //         player2: {
        //             groundArena: ['superlaser-technician']
        //         }
        //     });
        //
        //     const { context } = contextRef;
        //
        //     context.player1.clickCard(context.swoopDown);
        //     context.player1.clickCard(context.arquitensAssaultCruiser);
        //     context.player1.clickCard(context.superlaserTechnician);
        //
        //     expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
        //     context.player1.clickPrompt('You');
        //
        //     expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
        //     context.player1.clickPrompt('Trigger');
        //
        //     expect(context.player2).toBeActivePlayer();
        //     expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
        // });
    });
});
