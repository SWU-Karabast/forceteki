describe('Secret Marriage', function() {
    integration(function(contextRef) {
        it('Secret Marriage\'s ability should give Shield to each of up to 2 non-Vehicle unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-marriage'],
                    groundArena: ['wampa'],
                    spaceArena: ['mynock']
                },
                player2: {
                    groundArena: ['atst', 'yoda#old-master'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.secretMarriage);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.mynock]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.mynock);
            context.player1.clickCardNonChecking(context.yoda);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.mynock).toHaveExactUpgradeNames(['shield']);
            expect(context.yoda).toHaveExactUpgradeNames([]);
            expect(context.player1.hand.length).toBe(0);
        });

        it('Secret Marriage\'s ability should give Shield to each of up to 2 non-Vehicle unit (can choose less)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-marriage'],
                    groundArena: ['wampa'],
                    spaceArena: ['mynock']
                },
                player2: {
                    groundArena: ['atst', 'yoda#old-master'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.secretMarriage);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.mynock]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.mynock).toHaveExactUpgradeNames([]);
            expect(context.yoda).toHaveExactUpgradeNames([]);
            expect(context.player1.hand.length).toBe(0);
        });

        it('Secret Marriage\'s ability should give Shield to each of up to 2 non-Vehicle unit (can choose nothing)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-marriage'],
                    groundArena: ['wampa'],
                    spaceArena: ['mynock']
                },
                player2: {
                    groundArena: ['atst', 'yoda#old-master'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.secretMarriage);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.mynock]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickPrompt('Choose nothing');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.mynock).toHaveExactUpgradeNames([]);
            expect(context.yoda).toHaveExactUpgradeNames([]);
            expect(context.player1.hand.length).toBe(0);
        });

        it('Secret Marriage\'s ability should give Shield to each of up to 2 non-Vehicle unit. If you choose an enemy unit, draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['secret-marriage'],
                    groundArena: ['wampa'],
                    spaceArena: ['mynock']
                },
                player2: {
                    groundArena: ['atst', 'yoda#old-master'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.secretMarriage);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.mynock]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.yoda);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.yoda).toHaveExactUpgradeNames(['shield']);
            expect(context.mynock).toHaveExactUpgradeNames([]);
            expect(context.player1.hand.length).toBe(1);
        });
    });
});
