describe('Moral Authority', function () {
    integration(function (contextRef) {
        describe('Moral Authority\'s when played ability', function () {
            it('should only attach to a unique friendly unit and then capture an enemy unit with less remaining HP', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moral-authority'],
                        // Major Partagaz is unique; SpecForce Soldier is not
                        groundArena: ['major-partagaz#healthcare-provider', 'specforce-soldier']
                    },
                    player2: {
                        // Include a mix of enemy units and a deployed leader (leaders are not valid capture targets)
                        groundArena: ['battlefield-marine', 'wampa'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Play the upgrade
                context.player1.clickCard(context.moralAuthority);

                // Can only attach to unique friendly units => only Major Partagaz is selectable
                expect(context.player1).toBeAbleToSelectExactly([context.majorPartagazHealthcareProvider]);
                context.player1.clickCard(context.majorPartagazHealthcareProvider);

                // Now must choose an enemy non-leader unit with less remaining HP than the attached unit (Partagaz has 6)
                // Both enemy Battlefield Marine (~3 HP) and Wampa (5 HP) are valid; leader is not targetable
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeCapturedBy(context.majorPartagazHealthcareProvider);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow capturing units with equal or greater remaining HP than the attached unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moral-authority'],
                        // Damage Partagaz so remaining HP is 5 (hp 6 - damage 1)
                        groundArena: [{ card: 'major-partagaz#healthcare-provider', damage: 1 }]
                    },
                    player2: {
                        // Enemy with higher remaining HP (Wampa 5) and a smaller one (Battlefield Marine ~3)
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.moralAuthority);
                // Only the unique friendly unit is selectable to attach
                expect(context.player1).toBeAbleToSelectExactly([context.majorPartagazHealthcareProvider]);
                context.player1.clickCard(context.majorPartagazHealthcareProvider);

                // With 5 remaining HP on Partagaz, only enemy units with less than 5 are valid (strictly less)
                // So battlefield marine (3) is selectable; wampa (5) is not
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.majorPartagazHealthcareProvider);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});