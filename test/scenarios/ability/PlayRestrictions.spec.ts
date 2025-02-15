describe('Play Restrictions Interactions', function () {
    integration(function (contextRef) {
        it('Regional Governor\'s ability should prevent the blocked card being played via other cards like Ezra', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['regional-governor'],
                },
                player2: {
                    groundArena: ['ezra-bridger#resourceful-troublemaker'],
                    deck: ['battlefield-marine', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa']
                }
            });

            const { context } = contextRef;

            // play regional governor and say millenium falcon
            context.player1.clickCard(context.regionalGovernor);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Battlefield Marine');

            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.ezraBridger);
            context.player2.clickCard(context.p1Base);

            expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
            expect(context.player2).toHaveExactEnabledDisplayPromptPerCardButtons(['Discard it', 'Leave it on top of your deck']);
            expect(context.player2).toHaveExactDisabledDisplayPromptPerCardButtons(['Play it']);
            expect(context.getChatLogs(1)).not.toContain('Ezra Bridger sees Wampa');
            // check that the damage was done before player1 clicks prompt
            expect(context.p1Base.damage).toBe(3);

            context.player2.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'leave');
            expect(context.player1).toBeActivePlayer();
        });
    });
});
