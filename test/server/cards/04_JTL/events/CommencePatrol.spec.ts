describe('Commence Patrol', function () {
    integration(function (contextRef) {
        describe('Commence Patrol\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['commence-patrol'],
                        discard: ['battlefield-marine']
                    },
                    player2: {
                        discard: ['atst'],
                    }
                });
            });

            it('should be able to return a card from discard to bottom on deck and create a x-wing token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.commencePatrol);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 1);
                const xwing = context.player1.findCardByName('xwing');
                expect(xwing).toBeInZone('spaceArena');
                expect(xwing.exhausted).toBeTrue();
            });

            it('should be able to return a enemy card from discard to bottom on deck and create a x-wing token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.commencePatrol);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInBottomOfDeck(context.player2, 1);
                const xwing = context.player1.findCardByName('xwing');
                expect(xwing).toBeInZone('spaceArena');
                expect(xwing.exhausted).toBeTrue();
            });
        });

        it('should not create a x-wing if there is no cards to return on bottom of decks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commence-patrol'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.commencePatrol);
            context.player1.clickPrompt('Play anyway');

            expect(context.commencePatrol).toBeInZone('discard');
            expect(context.player1.getArenaCards().length).toBe(0);
        });
    });
});
