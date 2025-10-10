describe('Faith in Your Friends', function () {
    integration(function (contextRef) {
        it('should search the top 3 deck for a card and draw, then we may disclose Cunning, Cunning, Cunning, Heroism, Heroism to create 2 Spy tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['faith-in-your-friends', 'r2d2#full-of-solutions', 'millennium-falcon#piece-of-junk'],
                    deck: ['cunning', 'resupply', 'battlefield-marine']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.faithInYourFriends);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.cunning, context.resupply, context.battlefieldMarine],
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            context.player1.clickCardInDisplayCardPrompt(context.cunning);

            expect(context.cunning).toBeInZone('hand', context.player1);

            expect(context.player1).toHavePrompt('Disclose Cunning, Cunning, Cunning, Heroism, Heroism to create 2 Spy tokens');
            expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.cunning, context.millenniumFalcon]);
            context.player1.clickCard(context.r2d2);
            context.player1.clickCard(context.cunning);
            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickDone();


            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.r2d2, context.cunning, context.millenniumFalcon]);
            context.player2.clickDone();

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
        });

        it('cannot search the 3 deck as the deck is empty but we may disclose Cunning, Cunning, Cunning, Heroism, Heroism to create 2 Spy tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['faith-in-your-friends', 'cunning', 'r2d2#full-of-solutions', 'millennium-falcon#piece-of-junk'],
                    deck: []
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.faithInYourFriends);

            expect(context.player1).toHavePrompt('Disclose Cunning, Cunning, Cunning, Heroism, Heroism to create 2 Spy tokens');
            expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.cunning, context.millenniumFalcon]);
            context.player1.clickCard(context.r2d2);
            context.player1.clickCard(context.cunning);
            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickDone();


            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.r2d2, context.cunning, context.millenniumFalcon]);
            context.player2.clickDone();

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
        });
    });
});
