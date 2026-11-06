describe('Clone Commander Cody, Loyal to the Republic', function() {
    integration(function(contextRef) {
        it('should give an Experience token to another friendly Republic unit that enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['41st-elite-corps'],
                    groundArena: ['clone-commander-cody#loyal-to-the-republic'],
                    resources: 8,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context._41stEliteCorps);

            expect(context._41stEliteCorps).toBeInZone('groundArena');
            expect(context._41stEliteCorps).toHaveExactUpgradeNames(['experience']);
            expect(context.cloneCommanderCody).toHaveExactUpgradeNames([]);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger when a friendly non-Republic unit enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['clone-commander-cody#loyal-to-the-republic'],
                    resources: 4,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena');
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.player2).toBeActivePlayer();
        });

        it('should give an Experience token to a friendly Republic unit rescued from capture', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-commander-cody#loyal-to-the-republic', '41st-elite-corps', 'wampa'],
                },
                player2: {
                    hand: ['take-captive'],
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            // Player 2 captures the 41st Elite Corps with Battlefield Marine
            context.player2.clickCard(context.takeCaptive);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context._41stEliteCorps);
            expect(context._41stEliteCorps).toBeCapturedBy(context.battlefieldMarine);

            // Player 1 defeats the captor, rescuing the 41st Elite Corps, which re-enters play exhausted
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context._41stEliteCorps).toBeInZone('groundArena');
            expect(context._41stEliteCorps.exhausted).toBe(true);
            expect(context._41stEliteCorps).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger when an enemy Republic unit enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-commander-cody#loyal-to-the-republic'],
                },
                player2: {
                    hand: ['41st-elite-corps'],
                    resources: 8,
                }
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context._41stEliteCorps);

            expect(context._41stEliteCorps).toBeInZone('groundArena');
            expect(context._41stEliteCorps).toHaveExactUpgradeNames([]);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
