describe('Nute Gunray, Escaping Justice', function () {
    integration(function (contextRef) {
        describe('Nute Gunray Escaping Justice\'s ability', function () {
            it('should give Sentinel to another friendly Official unit when played and on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#escaping-justice'],
                        groundArena: ['regional-governor', 'guavian-antagonizer'],
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true }
                    },
                    player2: {
                        groundArena: ['colonel-yularen#isb-director'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nuteGunrayEscapingJustice);
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.emperorPalpatineGalacticRuler]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.regionalGovernor);

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.colonelYularenIsbDirector);

                // Regional Governor is only option available because of Sentinel
                expect(context.player2).toBeAbleToSelectExactly(context.regionalGovernor);

                context.player2.clickCard(context.regionalGovernor);
                expect(context.regionalGovernor.damage).toBe(2);

                // Testing on attack
                context.moveToNextActionPhase();

                context.player1.clickCard(context.nuteGunrayEscapingJustice);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.emperorPalpatineGalacticRuler]);
                context.player1.clickCard(context.emperorPalpatineGalacticRuler); // Gives Sentinel to leader

                // Emperor Palpatine only available option as it has Sentinel and Regional Governor lost previous phase Sentinel
                context.player2.clickCard(context.colonelYularenIsbDirector);
                expect(context.player2).toBeAbleToSelectExactly([context.emperorPalpatineGalacticRuler]);
                context.player2.clickCard(context.emperorPalpatineGalacticRuler);
            });

            it('should be passable', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#escaping-justice'],
                        groundArena: ['regional-governor', 'guavian-antagonizer'],
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true }
                    },
                    player2: {
                        groundArena: ['colonel-yularen#isb-director'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nuteGunrayEscapingJustice);
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.emperorPalpatineGalacticRuler]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.colonelYularenIsbDirector);

                // nobody has Sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.regionalGovernor, context.guavianAntagonizer, context.p1Base, context.emperorPalpatineGalacticRuler, context.nuteGunrayEscapingJustice]);

                context.player2.clickCard(context.p1Base);

                // Testing on attack
                context.moveToNextActionPhase();

                context.player1.clickCard(context.nuteGunrayEscapingJustice);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.emperorPalpatineGalacticRuler]);
                context.player1.clickPrompt('Pass');

                // Nobpdy has Sentinel
                context.player2.clickCard(context.colonelYularenIsbDirector);
                expect(context.player2).toBeAbleToSelectExactly([context.regionalGovernor, context.guavianAntagonizer, context.p1Base, context.emperorPalpatineGalacticRuler, context.nuteGunrayEscapingJustice]);
                context.player2.clickCard(context.emperorPalpatineGalacticRuler);
            });
        });
    });
});