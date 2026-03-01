describe('Combat Exercise', function () {
    integration(function (contextRef) {
        it('Should exhaust a friendly unit and give two experience tokens when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['combat-exercise'],
                    groundArena: ['greedo#slow-on-the-draw', 'boba-fett#for-a-price'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['toro-calican#ambitious-upstart']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.combatExercise);

            // Should be able to select friendly units
            expect(context.player1).toBeAbleToSelectExactly([context.greedoSlowOnTheDraw, context.bobaFettForAPrice, context.cartelSpacer]);

            context.player1.clickCard(context.greedoSlowOnTheDraw);
            expect(context.greedoSlowOnTheDraw).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.greedoSlowOnTheDraw.exhausted).toBeTrue();
        });

        it('Should not do anything when there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['combat-exercise'],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['boba-fett#for-a-price']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.combatExercise);

            context.player1.clickPrompt('Play anyway');

            expect(context.combatExercise).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('does not add upgrades if the unit was already exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['combat-exercise'],
                    groundArena: [
                        { card: 'battlefield-marine', exhausted: true },
                        { card: 'luke-skywalker#a-heros-beginning', exhausted: true },
                        { card: 'pyke-sentinel', exhausted: true }
                    ],
                    spaceArena: ['relentless#konstantines-folly'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });
            const { context } = contextRef;


            // Verify no upgrades initially
            expect(context.battlefieldMarine.upgrades.length).toBe(0);

            context.player1.clickCard(context.combatExercise);

            // Should still be able to target exhausted friendly units
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.lukeSkywalkerAHerosBeginning,
                context.relentless,
                context.pykeSentinel
            ]);

            // Select the battlefield marine
            context.player1.clickCard(context.battlefieldMarine);

            // Verify the unit remains exhausted (was already exhausted)
            expect(context.battlefieldMarine.exhausted).toBe(true);

            // Verify NO shield or experience tokens were added (because exhaust failed)
            expect(context.battlefieldMarine.upgrades.length).toBe(0);
        });
    });
});