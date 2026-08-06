describe('Inspiring Veteran', function() {
    integration(function(contextRef) {
        it('should give 1 to each of up to 3 exhausted units including itself', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspiring-veteran'],
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'battlefield-marine', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inspiringVeteran);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.inspiringVeteran, context.awing, context.battlefieldMarine]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.awing);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.inspiringVeteran);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.inspiringVeteran).toHaveExactUpgradeNames(['advantage']);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
        });

        it('should give 1 to each of up to 3 exhausted units choosing 2', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspiring-veteran'],
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'battlefield-marine', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inspiringVeteran);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.inspiringVeteran, context.awing, context.battlefieldMarine]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.awing);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.inspiringVeteran);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.inspiringVeteran).toHaveExactUpgradeNames(['advantage']);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
        });

        it('should give 1 to each of up to 3 exhausted units choosing 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspiring-veteran'],
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'battlefield-marine', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inspiringVeteran);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.inspiringVeteran, context.awing, context.battlefieldMarine]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.awing);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.inspiringVeteran).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
        });

        it('should give 1 to each of up to 3 exhausted units choosing nothing', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspiring-veteran'],
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'battlefield-marine', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inspiringVeteran);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.inspiringVeteran, context.awing, context.battlefieldMarine]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickPrompt('Choose nothing');

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.inspiringVeteran).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
        });
    });
});