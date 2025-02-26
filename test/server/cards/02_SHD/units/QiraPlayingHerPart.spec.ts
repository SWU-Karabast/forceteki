describe('Qi\'ra, Playing Her Part', function () {
    integration(function (contextRef) {
        it('should draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['qira#playing-her-part', 'battlefield-marine'],
                    leader: 'padme-amidala#serving-the-republic',
                    base: 'jabbas-palace'
                },
                player2: {
                    hand: ['battlefield-marine', 'resupply', 'vanquish', 'change-of-heart'],
                    leader: 'leia-organa#alliance-general',
                    base: 'level-1313'
                }
            });

            const { context } = contextRef;

            const marine1 = context.player1.findCardByName('battlefield-marine');
            const marine2 = context.player2.findCardByName('battlefield-marine');

            // play qira and increase cost of Battlefield Marine
            context.player1.clickCard(context.qira);

            // Cards are not revealed in chat
            expect(context.getChatLogs(1)[0]).not.toContain(marine2.title);
            expect(context.getChatLogs(1)[0]).not.toContain(context.resupply.title);
            expect(context.getChatLogs(1)[0]).not.toContain(context.vanquish.title);
            expect(context.getChatLogs(1)[0]).not.toContain(context.changeOfHeart.title);

            // Player sees the opponent's hand
            expect(context.player1).toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveExactViewableDisplayPromptCards([
                marine2,
                context.resupply,
                context.vanquish,
                context.changeOfHeart
            ]);

            context.player1.clickPrompt('Done');

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Battlefield Marine');

            // battlefield marine should cost 5
            expect(context.player2).toBeActivePlayer();
            context.player2.clickCard(marine2);
            expect(context.player2.exhaustedResourceCount).toBe(5);
            expect(context.player1).toBeActivePlayer();

            // our own marine should cost 2
            context.player1.clickCard(marine1);
            expect(context.player1.exhaustedResourceCount).toBe(6);

            context.player2.moveCard(marine2, 'hand');

            // another battlefield marine should cost 5 too
            context.player2.clickCard(marine2);
            expect(context.player2.exhaustedResourceCount).toBe(10);
            context.player2.moveCard(marine2, 'hand');

            context.moveToNextActionPhase();

            context.player1.passAction();

            // cost increase should remain on next phase
            context.player2.clickCard(marine2);
            expect(context.player2.exhaustedResourceCount).toBe(5);

            // reset
            context.player1.moveCard(marine1, 'hand');
            context.player2.moveCard(marine2, 'hand');
            context.moveToNextActionPhase();

            context.player1.passAction();

            // steal qira
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.qira);

            // player 1 marine should cost only 2
            context.player1.clickCard(marine1);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            // player 2 marine should still cost 5
            context.player2.clickCard(marine2);
            expect(context.player2.exhaustedResourceCount).toBe(11); // 6 from change of heart + 5 from increased marine

            context.player2.moveCard(marine2, 'hand');
            context.moveToNextActionPhase();

            context.player1.passAction();

            // kill qira
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.qira);

            context.player1.passAction();

            // player 2 marine should cost 2 as qira was defeated
            context.player2.clickCard(marine2);
            expect(context.player2.exhaustedResourceCount).toBe(9); // 7 from vanquish with penaly aspect + 2 from marine
        });
    });
});
