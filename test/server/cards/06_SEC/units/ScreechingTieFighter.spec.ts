describe('Screeching TIE Fighter\'s on-attack ability', function() {
    integration(function(contextRef) {
        it('removes all Keywords from a ground unit until the end of the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['screeching-tie-fighter'],
                    groundArena: ['crafty-smuggler', 'cloud-city-wing-guard']
                },
                player2: {
                    leader: {
                        card: 'qira#i-alone-survived',
                        deployed: true
                    },
                    spaceArena: ['green-squadron-awing'],
                    groundArena: [{
                        card: 'gor#grievouss-pet',
                        upgrades: ['devotion', 'clone-cohort', 'infiltrators-skill']
                    }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.screechingTieFighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([
                // Only ground units are selectable
                context.gor,
                context.craftySmuggler,
                context.cloudCityWingGuard,

                // Leader units can be targeted
                context.qira
            ]);
            context.player1.clickCard(context.gor);

            expect(context.gor.hasSomeKeyword('sentinel')).toBeFalse();
            expect(context.gor.hasSomeKeyword('ambush')).toBeFalse();
            expect(context.gor.hasSomeKeyword('overwhelm')).toBeFalse();
            expect(context.gor.hasSomeKeyword('raid')).toBeFalse();
            expect(context.gor.hasSomeKeyword('restore')).toBeFalse();
            expect(context.gor.hasSomeKeyword('saboteur')).toBeFalse();

            // Attack with Gor
            context.player2.clickCard(context.gor);

            // Only the sentinel can be targeted for the attack
            expect(context.player2).toBeAbleToSelectExactly([context.cloudCityWingGuard]);
            context.player2.clickCard(context.cloudCityWingGuard);
            expect(context.cloudCityWingGuard).toBeInZone('discard');

            // Gor did not restore any damage
            expect(context.p2Base.damage).toBe(2);

            // Base takes no overwhelm damage
            expect(context.p1Base.damage).toBe(0);
        });

        it('is automatically skipped if there are no ground units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['screeching-tie-fighter']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.screechingTieFighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('can be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['screeching-tie-fighter']
                },
                player2: {
                    leader: {
                        card: 'qira#i-alone-survived',
                        deployed: true
                    },
                    spaceArena: ['green-squadron-awing'],
                    groundArena: ['gor#grievouss-pet']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.screechingTieFighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.gor, context.qira]);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });
    });
});