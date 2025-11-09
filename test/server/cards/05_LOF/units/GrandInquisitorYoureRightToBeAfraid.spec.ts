describe('Grand Inquisitor, You\'re Right to Be Afraid', function() {
    integration(function(contextRef) {
        it('Grand Inquisitor\'s ability should give Seventh Sister Hidden', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['seventh-sister#implacable-inquisitor'],
                    groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    hand: ['battlefield-marine']
                }
            });
            const { context } = contextRef;
            const { player1, player2 } = context;

            player1.clickCard(context.seventhSister);

            expect(context.seventhSister.hasSomeKeyword('hidden')).toBeTrue();

            // check current hidden
            player2.clickCard(context.rebelPathfinder);
            expect(player2).toBeAbleToSelectExactly([context.grandInquisitorYoureRightToBeAfraid, context.p1Base]);
            player2.clickCard(context.p1Base);
        });

        it('Grand Inquisitor\'s ability should give Seventh Sister Hidden', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'third-sister#seething-with-ambition',
                    base: 'crystal-caves',
                    groundArena: ['grand-inquisitor#youre-right-to-be-afraid']
                },
                player2: {
                    leader: 'mother-talzin#power-through-magick',
                    base: 'crystal-caves',
                    groundArena: ['kiadimundi#composed-and-confident', 'karis#we-dont-like-strangers']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.thirdSister);
            context.player1.clickPrompt('Deploy Third Sister');

            context.player2.clickCard(context.kiadimundi);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.grandInquisitor]);
            context.player2.clickCard(context.grandInquisitor);

            expect(context.grandInquisitor).toBeInZone('discard', context.player1);

            context.player1.passAction();

            context.player2.clickCard(context.karis);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
        });
    });
});