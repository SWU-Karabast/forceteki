describe('DDC Defender', function() {
    integration(function(contextRef) {
        it('DDC Defender\'s ability should attach to non-vehicle units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ddc-defender'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                },
                player2: {
                    groundArena: ['porg'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ddcDefender);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.porg]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['ddc-defender']);
        });

        it('DDC Defender\'s ability should trigger on defense and allow dealing 1 damage and exhausting a unit in the same arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['ddc-defender'] }, 'wampa'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['porg', 'atst'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.porg);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.porg, context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
            expect(context.atst.damage).toBe(1);
        });

        it('DDC Defender\'s ability should trigger on defense and allow dealing 1 damage and exhausting a unit in the same arena (killing attacker)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['ddc-defender'] }, 'wampa'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['porg', 'atst'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.porg);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.porg, context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.porg);

            expect(context.player1).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
            expect(context.battlefieldMarine.damage).toBe(0);
        });

        it('DDC Defender\'s ability should trigger on defense and allow dealing 1 damage and exhausting a unit in the same arena (should not stop attack)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['ddc-defender'] }, 'wampa'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['porg', 'atst'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.porg, context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.ddcDefender).toBeInZone('discard');
        });
    });
});
