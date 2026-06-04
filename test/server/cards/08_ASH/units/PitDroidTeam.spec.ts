describe('Pit Droid Team', function() {
    integration(function(contextRef) {
        it('discounts the first upgrade played on another friendly unit each phase and resets next phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things', 'electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things']);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things', 'electrostaff']);
        });

        it('does not discount upgrades played on Pit Droid Team itself or count them as the first eligible upgrade', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things', 'electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.pitDroidTeam);

            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.pitDroidTeam).toHaveExactUpgradeNames(['on-top-of-things']);

            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['electrostaff']);
        });

        it('does not discount the second eligible upgrade played in the same phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things', 'electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things', 'electrostaff']);
        });
    });
});
