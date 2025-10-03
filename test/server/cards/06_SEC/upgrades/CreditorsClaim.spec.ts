describe('Creditor\'s Claim', function () {
    integration(function (contextRef) {
        it('Creditor\'s Claim when defeated ability should defeat a unit with 3 remaining HP or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['creditors-claim'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['rivals-fall'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.atst, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.player1).toBeActivePlayer();
        });

        it('Creditor\'s Claim when defeated ability should not trigger when upgrade is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['creditors-claim'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['disabling-fang-fighter'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.disablingFangFighter);
            context.player2.clickCard(context.creditorsClaim);

            expect(context.player1).toBeActivePlayer();
        });

        it('Creditor\'s Claim when defeated ability should defeat a unit with 3 remaining HP or less (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['creditors-claim'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            // Play the upgrade
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.awing, context.atst, context.battlefieldMarine]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.awing);

            expect(context.awing).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});