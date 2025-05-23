describe('Nameless Terror', function() {
    integration(function(contextRef) {
        describe('Nameless Terror\'s when played ability', function() {
            it('allows to exhaust a Force unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nameless-terror'],
                        groundArena: ['nightsister-warrior', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['jedi-guardian', 'wampa', { card: 'gungi#finding-himself', exhausted: true }],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.namelessTerror);
                expect(context.player1).toBeAbleToSelectExactly([context.nightsisterWarrior, context.jediGuardian, context.kananJarrus, context.gungi]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.jediGuardian);
                expect(context.jediGuardian.exhausted).toBeTrue();
            });
        });

        describe('Nameless Terror\'s on attack ability', function() {
            it('allows to exhaust a Force unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'shadowed-undercity',
                        groundArena: ['nameless-terror', 'nightsister-warrior', 'terentatek'],
                    },
                    player2: {
                        base: 'shadowed-undercity',
                        groundArena: ['jedi-guardian', 'wampa', { card: 'obiwan-kenobi#following-fate', damage: 3 }],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['gungi#finding-himself'],
                    }
                });

                const { context } = contextRef;

                // Terentatek should have ambush becuase the opponent has a Force unit
                expect(context.terentatek.hasSomeKeyword('ambush')).toBeTrue();
                expect(context.nightsisterWarrior.hasSomeTrait('force')).toBeTrue();
                expect(context.kananJarrus.hasSomeTrait('force')).toBeTrue();

                // Use Nameless Terror to defeat Obi-Wan Kenobi and removing the Force trait from all enemy units
                context.player1.clickCard(context.namelessTerror);
                context.player1.clickCard(context.obiwanKenobi);
                context.player2.clickCard(context.kananJarrus);

                expect(context.player2.handSize).toBe(1);
                expect(context.terentatek.hasSomeKeyword('ambush')).toBeFalse();
                expect(context.nightsisterWarrior.hasSomeTrait('force')).toBeTrue();
                expect(context.kananJarrus.hasSomeTrait('force')).toBeFalse();
                expect(context.jediGuardian.hasSomeTrait('force')).toBeFalse();

                // Play Gungi and check that it has the Force trait
                context.player2.clickCard(context.gungi);

                expect(context.terentatek.hasSomeKeyword('ambush')).toBeTrue();
                expect(context.nightsisterWarrior.hasSomeTrait('force')).toBeTrue();
                expect(context.kananJarrus.hasSomeTrait('force')).toBeFalse();
                expect(context.jediGuardian.hasSomeTrait('force')).toBeFalse();
                expect(context.gungi.hasSomeTrait('force')).toBeTrue();

                // Move to the next phase and check that the Force trait is back
                context.moveToRegroupPhase();

                expect(context.terentatek.hasSomeKeyword('ambush')).toBeTrue();
                expect(context.nightsisterWarrior.hasSomeTrait('force')).toBeTrue();
                expect(context.kananJarrus.hasSomeTrait('force')).toBeTrue();
                expect(context.jediGuardian.hasSomeTrait('force')).toBeTrue();
                expect(context.gungi.hasSomeTrait('force')).toBeTrue();
            });
        });
    });
});