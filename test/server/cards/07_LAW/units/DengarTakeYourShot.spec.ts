describe('Dengar, Take Your Shot', function () {
    integration(function (contextRef) {
        describe('Dengar\'s triggered ability', function () {
            it('creates a credit token when the unit with the highest cost among enemy units is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'hidden-sharpshooter',
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Open Fire to defeat Hidden Sharpshooter
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.hiddenSharpshooter);

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
            });

            it('triggers when multiple enemy units are defeated simultaneously and one has the highest cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'hidden-sharpshooter'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Overwhelming Barrage to defeat both enemy units
                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.dengar);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.hiddenSharpshooter, 3],
                    [context.battlefieldMarine, 3]
                ]));

                // Both units are defeated
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.player1.credits).toBe(1);
            });

            it('triggers when the only enemy unit in play is defeated, even if that unit has 0 cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elite-p38-starfighter'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'porg' // 0 cost unit
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Elite P38 Starfighter
                context.player1.clickCard(context.eliteP38Starfighter);

                // Use the ping damage to defeat Porg
                context.player1.clickCard(context.porg);
                expect(context.porg).toBeInZone('discard');

                // Dengar should get a Credit token since Porg was the only enemy unit
                expect(context.player1.credits).toBe(1);
            });

            it('can only be used once per round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire', 'vanquish'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'hidden-sharpshooter'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Open Fire to defeat Hidden Sharpshooter
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.hiddenSharpshooter);

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);

                context.player2.passAction();

                // Play Vanquish to defeat Battlefield Marine
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // Dengar should NOT get another Credit token since the ability is once per round
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
            });

            it('can be used again in the next round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire', 'vanquish'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'hidden-sharpshooter'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Open Fire to defeat Hidden Sharpshooter
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.hiddenSharpshooter);

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);

                context.moveToNextActionPhase();

                // Play Vanquish to defeat Battlefield Marine
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // Dengar should get another Credit token since it's a new round
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.credits).toBe(2);
            });

            it('can be used by each player in the same round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: ['dengar#take-your-shot', 'death-star-stormtrooper']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['hidden-sharpshooter']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Open Fire to defeat Hidden Sharpshooter
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.hiddenSharpshooter);

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);

                // Player 2 plays Change of Heart to take control of Dengar
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.dengar);

                context.player1.passAction();

                // Player 2 attacks Death Star Stormtrooper with Dengar to defeat it
                context.player2.clickCard(context.dengar);
                context.player2.clickCard(context.deathStarStormtrooper);

                // Dengar should get a Credit token since Death Star Stormtrooper was the highest cost enemy unit
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.player2.credits).toBe(1);
            });

            it('still triggers if Dengar was defeated simultaneously with the enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bombing-run'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'hidden-sharpshooter'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Bombing Run to deal 3 damage to all ground units
                context.player1.clickCard(context.bombingRun);
                context.player1.clickPrompt('Ground');

                // All units should be defeated
                expect(context.dengar).toBeInZone('discard');
                expect(context.hiddenSharpshooter).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Dengar should get a Credit token since Hidden Sharpshooter was the highest cost enemy unit
                expect(context.player1.credits).toBe(1);
            });

            it('only resolves once if multiple units with the same highest cost are defeated simultaneously', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['dengar#take-your-shot']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'chandrilan-sponsor' // Two units with the same cost
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Overwhelming Barrage to defeat both enemy units
                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.dengar);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.chandrilanSponsor, 3],
                    [context.battlefieldMarine, 3]
                ]));

                // Both units are defeated
                expect(context.chandrilanSponsor).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Ability triggers twice since they're both the highest cost
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Create a Credit token: Battlefield Marine',
                    'Create a Credit token: Chandrilan Sponsor'
                ]);

                // Arbitrarily pick the first one to resolve
                context.player1.clickPrompt('Create a Credit token: Battlefield Marine');
                expect(context.player1.credits).toBe(1);

                // No further action to resolve for the second trigger since the limit is once per round
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});