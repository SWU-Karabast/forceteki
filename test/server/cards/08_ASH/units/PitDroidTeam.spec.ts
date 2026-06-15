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

        it('does not count an opponent playing an upgrade on their own unit against the discount', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things'],
                    groundArena: ['pit-droid-team', 'battlefield-marine'],
                },
                player2: {
                    hand: ['entrenched'],
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.entrenched);
            context.player2.clickCard(context.wampa);

            expect(context.player2.exhaustedResourceCount).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['entrenched']);

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things']);
        });

        it('does not count an opponent playing an upgrade on our unit against the discount', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine', 'jedi-guardian'],
                },
                player2: {
                    hand: ['entrenched'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.entrenched);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player2.exhaustedResourceCount).toBe(2);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['entrenched']);

            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.jediGuardian);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.jediGuardian).toHaveExactUpgradeNames(['electrostaff']);
        });

        it('does not discount upgrades we play on enemy units or count them against the discount', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['entrenched', 'electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.wampa);

            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['entrenched']);

            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['electrostaff']);
        });

        it('does not discount the second eligible upgrade even when it is played on a separate friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things', 'electrostaff'],
                    groundArena: ['pit-droid-team', 'battlefield-marine', 'jedi-guardian'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things']);

            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.jediGuardian);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.jediGuardian).toHaveExactUpgradeNames(['electrostaff']);
        });

        it('does not discount upgrades if Pit Droid Team enters play after the first eligible upgrade this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    base: 'jedha-city',
                    hand: ['on-top-of-things', 'pit-droid-team', 'electrostaff'],
                    groundArena: ['battlefield-marine', 'jedi-guardian'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['on-top-of-things']);

            context.player2.passAction();
            context.player1.clickCard(context.pitDroidTeam);

            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.pitDroidTeam).toBeInZone('groundArena');

            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.jediGuardian);

            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect(context.jediGuardian).toHaveExactUpgradeNames(['electrostaff']);
        });
    });
});
