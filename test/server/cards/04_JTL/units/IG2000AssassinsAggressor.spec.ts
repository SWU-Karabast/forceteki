describe('IG-2000, Assassins\'s Aggressor', function () {
    integration(function (contextRef) {
        it('IG-2000, Assassins\'s Aggressor\'s ability should deal 1 damage to each of up to 3 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ig2000#assassins-aggressor'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tie-advanced']
                }
            });

            const { context } = contextRef;

            function reset() {
                context.ig2000.moveTo('hand');
                context.setDamage(context.wampa, 0);
                context.setDamage(context.atst, 0);
                context.player2.passAction();
            }

            // Play IG-2000, Assassins' Aggressor
            context.player1.clickCard(context.ig2000);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieAdvanced, context.ig2000]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.ig2000);
            context.player1.clickCardNonChecking(context.tieAdvanced);
            context.player1.clickDone();

            // Assert the damage
            expect(context.wampa.damage).toBe(1);
            expect(context.atst.damage).toBe(1);
            expect(context.ig2000.damage).toBe(1);
            expect(context.tieAdvanced.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();

            // Reset the game state
            reset();

            // Play IG-2000, Assassins' Aggressor and select only 2 units
            context.player1.clickCard(context.ig2000);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieAdvanced, context.ig2000]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);
            context.player1.clickDone();

            // Assert the damage
            expect(context.wampa.damage).toBe(1);
            expect(context.atst.damage).toBe(1);
            expect(context.ig2000.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();

            // Reset the game state
            reset();

            // Play IG-2000, Assassins' Aggressor and select only 1 units
            context.player1.clickCard(context.ig2000);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieAdvanced, context.ig2000]);
            context.player1.clickPrompt('Choose nothing');

            // Assert the damage
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(0);
            expect(context.ig2000.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('IG-2000, Assassins\'s Aggressor\'s ability should deal 1 damage to each of up to 3 units even with same name', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ig2000#assassins-aggressor'],
                    groundArena: ['han-solo#reluctant-hero'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tie-advanced']
                }
            });

            const { context } = contextRef;

            // Play IG-2000, Assassins' Aggressor
            context.player1.clickCard(context.ig2000);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.hanSoloAudaciousSmuggler, context.hanSoloReluctantHero, context.tieAdvanced, context.atst, context.ig2000]);
            context.player1.clickCard(context.hanSoloAudaciousSmuggler);
            context.player1.clickCard(context.hanSoloReluctantHero);
            context.player1.clickCard(context.ig2000);
            context.player1.clickCardNonChecking(context.tieAdvanced);
            context.player1.clickDone();

            // Assert the damage
            expect(context.hanSoloAudaciousSmuggler.damage).toBe(1);
            expect(context.hanSoloReluctantHero.damage).toBe(1);
            expect(context.ig2000.damage).toBe(1);
            expect(context.tieAdvanced.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
