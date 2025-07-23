describe('General Rieekan, Stalwart Tactician', function () {
    integration(function (contextRef) {
        const actionName = 'Attack with another Heroism unit. It gets +2/+0 for this attack';

        it('General Rieekan\'s ability should allow another Heroism unit to attack with +2/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-rieekan#stalwart-tactician', 'atst'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.generalRieekan);
            expect(context.player1).toHaveExactPromptButtons([actionName, 'Attack', 'Cancel']);
            context.player1.clickPrompt(actionName);
            expect(context.player1).toBeAbleToSelectExactly([context.phoenixSquadronAwing]);
            context.player1.clickCard(context.phoenixSquadronAwing);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.phoenixSquadronAwing.getPower()).toBe(3);
            expect(context.generalRieekanStalwartTactician.exhausted).toBe(true);
        });
    });
});