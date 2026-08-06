describe('Rukh, From the Shadows', function() {
    integration(function(contextRef) {
        it('Rukh\'s ability should give 3 Advantage to a unit when attack ends and the defending unit was defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rukh#from-the-shadows'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['han-solo#hibernation-sick', 'atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.hanSolo);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.atst, context.rukh]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });

        it('Rukh\'s ability should give 3 Advantage to a unit when attack ends and the defending unit was defeated (can be passed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rukh#from-the-shadows'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['han-solo#hibernation-sick', 'atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.hanSolo);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.atst, context.rukh]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.rukh).toHaveExactUpgradeNames([]);
        });

        it('Rukh\'s ability should not trigger if defending unit was not defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rukh#from-the-shadows'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
        });

        it('Rukh\'s ability should trigger even if he dies', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rukh#from-the-shadows'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: [{ card: 'atst', damage: 6 }, 'wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });

        it('Rukh\'s support ability should give 3 Advantage to a unit when attack ends and the defending unit was defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rukh#from-the-shadows'],
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rukh);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa, context.atst, context.rukh]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.rukh);

            expect(context.player2).toBeActivePlayer();
            expect(context.rukh).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });
    });
});
