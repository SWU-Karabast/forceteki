describe('Allegiant General Pryde, Ruthless and Loyal', function () {
    integration(function (contextRef) {
        it('Allegiant General Pryde\'s ability should put the top card of deck in resource if we control less resources than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#ruthless-and-loyal']
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['devotion', 'shield', 'the-darksaber'] }, 'crafty-smuggler']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.allegiantGeneralPryde);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Opponent');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));

            expect(context.player2).toBeActivePlayer();

            context.allegiantGeneralPryde.exhausted=false;
            context.player2.passAction();

            context.player1.clickCard(context.allegiantGeneralPryde);
            context.player1.clickPrompt('Opponent');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.craftySmuggler, 1],
                [context.battlefieldMarine, 1],
            ]));

            expect(context.player1).toBeAbleToSelectExactly([context.devotion, context.shield]);
            expect(context.player1).toHaveChooseNoTargetButton()

            context.player1.clickCard(context.devotion);

            expect(context.player2).toBeActivePlayer();
            expect(context.devotion).toBeInZone('discard')
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield', 'the-darksaber']);

        });
    });
});
