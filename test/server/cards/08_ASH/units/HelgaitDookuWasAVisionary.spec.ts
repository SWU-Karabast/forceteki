describe('Helgait, Dooku was a Visionary', function () {
    integration(function (contextRef) {
        it('Helgait\'s ability should distribute Advantage tokens equal to this unit\'s power among friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['helgait#dooku-was-a-visionary', 'wampa', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall'],
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.helgait);

            expect(context.player1).toHavePrompt('Distribute 6 Advantage tokens among targets');
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa, context.battlefieldMarine]);

            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.awing, 2],
                [context.wampa, 2],
                [context.battlefieldMarine, 2]
            ]), 'distributeAdvantage');

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
        });

        it('Helgait\'s ability should distribute Advantage tokens equal to this unit\'s power among friendly units (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['helgait#dooku-was-a-visionary', 'wampa', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['no-glory-only-results'],
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.helgait);

            expect(context.player2).toHavePrompt('Distribute 6 Advantage tokens among targets');
            expect(context.player2).toBeAbleToSelectExactly([context.atst]);

            context.player2.setDistributeAmongTargetsPromptState(new Map([
                [context.atst, 6],
            ]), 'distributeAdvantage');

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage', 'advantage', 'advantage']);
        });

        it('Helgait\'s ability should not distribute any Advantage tokens if his power was 0 before being defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['helgait#dooku-was-a-visionary', 'wampa', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    hasInitiative: true,
                    discard: ['i-am-your-father', 'drop-in'],
                    hand: ['anakin-skywalker#champion-of-mortis'],
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.anakinSkywalker);

            context.player2.clickPrompt('If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase');
            context.player2.clickCard(context.helgait);
            context.player2.clickCard(context.helgait);

            expect(context.player1).toBeActivePlayer();
            expect(context.helgait).toBeInZone('discard');

            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
        });
    });
});