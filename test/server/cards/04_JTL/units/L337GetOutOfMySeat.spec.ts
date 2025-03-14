describe('L3-37, Get Out of my seat', function() {
    integration(function(contextRef) {
        it('L3-37\'s ability should allow to attach it to a vehicle unit without pilot when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['l337#get-out-of-my-seat', 'atst', { card: 'escort-skiff', upgrades: ['bb8#happy-beeps'] }, 'battlefield-marine'],
                    spaceArena: [{ card: 'restored-arc170', upgrades: ['wingman-victor-two#mauler-mithel'] }, 'green-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['mining-guild-tie-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.l337);
            expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing]);
            context.player1.clickCard(context.atst);
            expect(context.atst).toHaveExactUpgradeNames(['l337#get-out-of-my-seat']);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
