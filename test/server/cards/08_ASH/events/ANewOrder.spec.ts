describe('A New Order', function() {
    integration(function(contextRef) {
        it('A New Order\'s ability should give an Advantage token to two friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.awing);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('A New Order\'s ability should give an Advantage to 2 enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.lurkingTiePhantom);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames(['advantage']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['advantage']);

            expect(context.player2).toBeActivePlayer();
        });

        it('A New Order\'s ability should give an Advantage to one enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames(['advantage']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('A New Order\'s ability should give an Advantage token to a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('A New Order\'s ability should give Advantage to one enemy and one friendly', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames(['advantage']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('A New Order\'s ability should be able to choose nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-order'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewOrder);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickPrompt('Choose nothing');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });
    });
});