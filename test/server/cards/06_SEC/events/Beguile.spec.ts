describe('Beguile', function () {
    integration(function (contextRef) {
        it('Beguile\'s ability should look the opponent\'s hand, then return to hand an enemy unit which costs 6 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['beguile'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['awing', 'green-squadron-awing'],
                    groundArena: ['yoda#old-master', 'atst'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'phoenix-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.beguile);
            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.awing, context.greenSquadronAwing]);
            context.player1.clickDone();

            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.atst, context.phoenixSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('hand', context.player2);
            expect(context.avenger).toBeInZone('spaceArena', context.player2);
            expect(context.phoenixSquadronAwing).toBeInZone('spaceArena', context.player2);
            expect(context.yoda).toBeInZone('groundArena', context.player2);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
        });

        it('Beguile\'s ability should return to hand an enemy unit which costs 6 or less (opponent does not have any cards in hand)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['beguile'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['yoda#old-master', 'atst'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'phoenix-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.beguile);

            expect(context.player1).toHavePrompt('Return to hand an enemy non-leader unit which costs 6 or less');
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.atst, context.phoenixSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('hand', context.player2);
            expect(context.avenger).toBeInZone('spaceArena', context.player2);
            expect(context.phoenixSquadronAwing).toBeInZone('spaceArena', context.player2);
            expect(context.yoda).toBeInZone('groundArena', context.player2);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
        });
    });
});
