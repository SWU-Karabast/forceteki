describe('Keep Them Talking', function() {
    integration(function(contextRef) {
        it('Keep Them Talking\'s ability should exhaust two friendly units that cost 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.awing);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.awing.exhausted).toBeTrue();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeFalse();
            expect(context.lurkingTiePhantom.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Keep Them Talking\'s ability should exhaust two enemy units that cost 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.lurkingTiePhantom);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingTiePhantom.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('Keep Them Talking\'s ability should exhaust one enemy unit that costs 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingTiePhantom.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Keep Them Talking\'s ability should exhaust one friendly unit that costs 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeFalse();
            expect(context.lurkingTiePhantom.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Keep Them Talking\'s ability should exhaust one enemy unit and one friendly unit that cost 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.lurkingTiePhantom.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Keep Them Talking\'s ability should be able to choose nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-them-talking'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.keepThemTalking);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.rebelPathfinder, context.lurkingTiePhantom]);

            context.player1.clickPrompt('Choose nothing');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.rebelPathfinder.exhausted).toBeFalse();
            expect(context.lurkingTiePhantom.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });
    });
});