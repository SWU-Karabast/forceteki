describe('Token units', function() {
    integration(function(contextRef) {
        describe('Token units', function() {
            it('should enter exhausted by default and async function in the arena like normal units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['drop-in', 'droid-deployment'],
                    },
                    player2: {
                        groundArena: ['regional-governor']
                    }
                });

                const { context } = contextRef;

                // test with Battle Droids
                context.player1.clickCard(context.droidDeployment);
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();

                context.player2.passAction();

                // test with Clone Troopers
                context.player1.clickCard(context.dropIn);
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(2);
                expect(cloneTroopers).toAllBeInZone('groundArena');
                expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();

                context.moveToNextActionPhase();

                expect(battleDroids.every((battleDroid) => !battleDroid.exhausted)).toBeTrue();
                expect(cloneTroopers.every((cloneTrooper) => !cloneTrooper.exhausted)).toBeTrue();

                // do combat, Battle Droid is exhausted and takes damage
                context.player1.clickCard(battleDroids[0]);
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(battleDroids[0].exhausted).toBeTrue();

                context.player2.passAction();

                // do combat, Clone Trooper is exhausted and takes damage
                context.player1.clickCard(cloneTroopers[0]);
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.p2Base]);
                context.player1.clickCard(context.regionalGovernor);
                expect(context.regionalGovernor.damage).toBe(2);
                expect(cloneTroopers[0].damage).toBe(1);
                expect(cloneTroopers[0].exhausted).toBeTrue();
            });

            it('should correctly register as defeated when defeated due to effects or damage, and then be moved outside the game', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-krell#heartless-tactician', 'battle-droid', 'battle-droid', 'battle-droid'],
                        hand: ['vanquish'],
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                const battleDroids = context.player1.findCardsByName('battle-droid');

                // CASE 1: defeat due to combat
                context.player2.clickCard(context.regionalGovernor);
                expect(context.player2).toBeAbleToSelectExactly([...battleDroids, context.p1Base, context.generalKrell]);
                context.player2.clickCard(battleDroids[0]);
                expect(battleDroids[0]).toBeInZone('outsideTheGame');
                expect(context.regionalGovernor.damage).toBe(1);

                // confirm that Battle Droid defeat event registered correctly and triggered Krell ability
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Draw a card');

                // CASE 2: defeat due to direct defeat effect
                context.player1.clickCard(context.vanquish);
                expect(context.player1).toBeAbleToSelectExactly([battleDroids[1], battleDroids[2], context.generalKrell, context.regionalGovernor]);
                context.player1.clickCard(battleDroids[1]);
                expect(battleDroids[1]).toBeInZone('outsideTheGame');

                // confirm that Battle Droid defeat event registered correctly and triggered Krell ability
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Draw a card');

                // CASE 3: defeat to -hp effect
                context.player2.clickCard(context.supremeLeaderSnoke);
                expect(battleDroids[2]).toBeInZone('outsideTheGame');

                // confirm that Battle Droid defeat event registered correctly and triggered Krell ability
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Draw a card');
            });

            it('should be moved outside the game if they would be moved out of the arena, but not register as defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-krell#heartless-tactician', 'clone-trooper', 'clone-trooper'],
                        hand: ['waylay'],
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                        hand: ['take-captive']
                    }
                });

                const { context } = contextRef;

                const cloneTroopers = context.player1.findCardsByName('clone-trooper');

                // CASE 1: return to hand
                context.player1.clickCard(context.waylay);
                expect(context.player1).toBeAbleToSelectExactly([...cloneTroopers, context.regionalGovernor, context.generalKrell]);
                context.player1.clickCard(cloneTroopers[0]);
                expect(cloneTroopers[0]).toBeInZone('outsideTheGame');
                expect(context.player1.handSize).toBe(0);
                expect(context.player2).toBeActivePlayer();     // should be no Krell trigger since there was no defeat

                // CASE 2: capture
                context.player2.clickCard(context.takeCaptive);
                context.player2.clickCard(context.regionalGovernor);
                expect(context.player2).toBeAbleToSelectExactly([cloneTroopers[1], context.generalKrell]);
                context.player2.clickCard(cloneTroopers[1]);
                expect(cloneTroopers[1]).toBeInZone('outsideTheGame');
                expect(context.regionalGovernor.capturedUnits.length).toBe(0);
                expect(context.player1).toBeActivePlayer();     // should be no Krell trigger since there was no defeat
            });
        });
    });
});
