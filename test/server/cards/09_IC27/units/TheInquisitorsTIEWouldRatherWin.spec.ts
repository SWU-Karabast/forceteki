describe('The Inquisitor\'s TIE Would Rather Win', function() {
    integration(function(contextRef) {
        it('The Inquisitor\'s TIE Would Rather Win\'s ability should make each player with 4 cards or more in hand to discard a card from hand (opponent)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    spaceArena: ['the-inquisitors-tie#would-rather-win']
                },
                player2: {
                    hand: ['atst', 'wampa', 'yoda#old-master', 'rey#skywalker'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theInquisitorsTie);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toHavePrompt('Choose a card to discard for The Inquisitor\'s TIE\'s effect');
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.wampa, context.yoda, context.rey]);

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player2);
        });

        it('The Inquisitor\'s TIE Would Rather Win\'s ability should make each player with 4 cards or more in hand to discard a card from hand (controller)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atst', 'wampa', 'yoda#old-master', 'rey#skywalker'],
                    spaceArena: ['the-inquisitors-tie#would-rather-win']
                },
                player2: {
                    hand: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theInquisitorsTie);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Choose a card to discard for The Inquisitor\'s TIE\'s effect');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.yoda, context.rey]);

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player1);
        });

        it('The Inquisitor\'s TIE Would Rather Win\'s ability should make each player with 4 cards or more in hand to discard a card from hand (both)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atst', 'wampa', 'yoda#old-master', 'rey#skywalker', 'avenger#hunting-the-rebels'],
                    spaceArena: ['the-inquisitors-tie#would-rather-win']
                },
                player2: {
                    hand: ['battlefield-marine', 'awing', 'gungi#finding-himself', 'phoenix-squadron-awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theInquisitorsTie);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Choose a card to discard for The Inquisitor\'s TIE\'s effect');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.yoda, context.rey, context.avenger]);

            context.player1.clickCard(context.wampa);

            expect(context.player2).toHavePrompt('Choose a card to discard for The Inquisitor\'s TIE\'s effect');
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.gungi, context.phoenixSquadronAwing]);

            context.player2.clickCard(context.gungi);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.gungi).toBeInZone('discard', context.player2);
        });
    });
});
