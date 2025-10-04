
describe('DJ, Need A Lift?', function () {
    integration(function (contextRef) {
        const friendlyUnitPrompt = 'Choose a friendly unit to capture a unit you play from your hand';
        const unitInHandPrompt = (friendlyUnit: string) => `Choose a unit in your hand to play for 1 Resource less. ${friendlyUnit} captures it.`;

        describe('a leader with two cunning aspects', function () {
            it('can play double cunning cards without aspect penalty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        base: 'echo-base',
                        hand: ['jar-jar-binks#foolish-gungan'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jarJarBinks);
                expect(context.jarJarBinks).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        describe('DJ\'s leader side action ability', function () {
            it('selects a friendly unit and plays a unit from hand for 1 resource less, then that friendly unit captures it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        groundArena: ['swoop-racer'],
                        spaceArena: ['hotshot-vwing'],
                        hand: ['resourceful-pursuers', 'shoot-first', 'snapshot-reflexes']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only friendly units are selectable
                    context.swoopRacer,
                    context.hotshotVwing
                ]);

                // Choose Swoop Racer
                context.player1.clickCard(context.swoopRacer);
                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only units in hand are selectable
                    context.resourcefulPursuers
                ]);

                // Choose Resourceful Pursuers
                context.player1.clickCard(context.resourcefulPursuers);

                expect(context.resourcefulPursuers).toBeCapturedBy(context.swoopRacer);
                expect(context.player1.exhaustedResourceCount).toBe(4); // Cost is reduced by 1
                expect(context.dj.exhausted).toBeTrue();
            });

            it('when played abilities resolve after the capture', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        groundArena: ['swoop-racer'],
                        hand: ['cantina-bouncer']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);

                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
                context.player1.clickCard(context.swoopRacer);

                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBouncer]);
                context.player1.clickCard(context.cantinaBouncer);

                // Cantina Bouncer is captured by Swoop Racer
                expect(context.cantinaBouncer).toBeCapturedBy(context.swoopRacer);
                expect(context.player1.exhaustedResourceCount).toBe(4); // Cost is reduced by 1
                expect(context.dj.exhausted).toBeTrue();

                // Now the When Played ability of Cantina Bouncer should trigger
                expect(context.player1).toHavePrompt('Return a non-leader unit to its owner\'s hand.');
                context.player1.clickCard(context.atst);

                // AT-ST is returned to P2's hand
                expect(context.atst).toBeInZone('hand', context.player2);
            });

            it('when played abilities that refer to the played unit fizzle because it is out of play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        base: 'echo-base',
                        resources: 5,
                        groundArena: ['swoop-racer'],
                        hand: ['discerning-veteran']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);

                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
                context.player1.clickCard(context.swoopRacer);

                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran]);
                context.player1.clickCard(context.discerningVeteran);

                // Discerning Veteran is captured by Swoop Racer
                expect(context.discerningVeteran).toBeCapturedBy(context.swoopRacer);
                expect(context.player1.exhaustedResourceCount).toBe(4); // Cost is reduced by 1
                expect(context.dj.exhausted).toBeTrue();

                // Discerning Veteran's When Played ability fizzles because it is no longer in play
                expect(context.player2).toBeActivePlayer();
            });

            it('can play a 1 cost unit for free when no resources are ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: {
                            exhaustedCount: 5,
                            readyCount: 0
                        },
                        groundArena: ['swoop-racer'],
                        hand: ['independent-smuggler']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dj);

                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
                context.player1.clickCard(context.swoopRacer);

                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([context.independentSmuggler]);
                context.player1.clickCard(context.independentSmuggler);

                expect(context.independentSmuggler).toBeCapturedBy(context.swoopRacer);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.dj.exhausted).toBeTrue();
            });

            it('interacts correctly with the uniqueness rule', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        groundArena: ['swoop-racer', 'jar-jar-binks#foolish-gungan'],
                        hand: ['jar-jar-binks#foolish-gungan']
                    }
                });

                const { context } = contextRef;
                const p1JarJars = context.player1.findCardsByName('jar-jar-binks#foolish-gungan');
                const jarJarInHand = p1JarJars.find((jarJar) => jarJar.zoneName === 'hand');
                const jarJarInPlay = p1JarJars.find((jarJar) => jarJar.zoneName === 'groundArena');

                context.player1.clickCard(context.dj);

                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer, jarJarInPlay]);
                context.player1.clickCard(context.swoopRacer);

                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([jarJarInHand]);
                context.player1.clickCard(jarJarInHand);

                expect(context.player1).toHavePrompt('Choose which copy of Jar Jar Binks, Foolish Gungan to defeat');
                expect(context.player1).toBeAbleToSelectExactly([jarJarInPlay, jarJarInHand]);

                // Choose the one that was played via DJ's ability
                context.player1.clickCard(jarJarInHand);

                expect(jarJarInHand).toBeInZone('discard', context.player1);
                expect(jarJarInPlay).toBeInZone('groundArena', context.player1);
                expect(context.swoopRacer.capturedUnits.length).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.dj.exhausted).toBeTrue();
            });

            it('interacts correctly with units that cannot be captured', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        groundArena: ['swoop-racer'],
                        hand: ['ig11#i-cannot-be-captured']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);

                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
                context.player1.clickCard(context.swoopRacer);

                expect(context.player1).toHavePrompt(unitInHandPrompt(context.swoopRacer.title));
                expect(context.player1).toBeAbleToSelectExactly([context.ig11]);
                context.player1.clickCard(context.ig11);

                // IG-11 cannot be captured. He is instead defeated and deals 3 damage to enemy ground units
                expect(context.ig11).toBeInZone('discard', context.player1);
                expect(context.atst.damage).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(4); // Cost is reduced by 1
                expect(context.dj.exhausted).toBeTrue();
            });

            it('does nothing if there are no friendly units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        hand: ['resourceful-pursuers', 'shoot-first', 'snapshot-reflexes']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);
                expect(context.player1).toHaveNoEffectAbilityPrompt(friendlyUnitPrompt);
                context.player1.clickPrompt('Use it anyway');

                expect(context.dj.exhausted).toBeTrue();
            });

            it('does nothing if there are no units in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        groundArena: ['swoop-racer'],
                        hand: ['shoot-first', 'snapshot-reflexes']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);

                expect(context.player1).toHaveNoEffectAbilityPrompt(friendlyUnitPrompt);
                context.player1.clickPrompt('Use it anyway');

                expect(context.dj.exhausted).toBeTrue();
            });

            it('does nothing if the units in hand cannot be paid for after the discount', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: {
                            exhaustedCount: 2,
                            readyCount: 3
                        },
                        groundArena: ['swoop-racer'],
                        hand: ['cantina-bouncer', 'shoot-first', 'snapshot-reflexes']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Activate DJ's ability
                context.player1.clickCard(context.dj);

                expect(context.player1).toHaveNoEffectAbilityPrompt(friendlyUnitPrompt);
                context.player1.clickPrompt('Use it anyway');

                expect(context.dj.exhausted).toBeTrue();
            });
        });

        describe('DJ\'s unit side constant ability', function () {
            it('friendly units rescued from an enemy captor enter play ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'dj#need-a-lift',
                            deployed: true
                        },
                        groundArena: ['swoop-racer'],
                        hand: ['cantina-bouncer']
                    },
                    player2: {
                        hand: ['cad-bane#hostage-taker'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 plays Cad Bane and captures Swoop Racer
                context.player2.clickCard(context.cadBane);
                context.player2.clickCard(context.swoopRacer);
                context.player2.clickDone();
                expect(context.swoopRacer).toBeCapturedBy(context.cadBane);

                // P1 plays Cantina Bouncer to return Cad Bane to P2's hand
                context.player1.clickCard(context.cantinaBouncer);
                context.player1.clickCard(context.cadBane);
                expect(context.cadBane).toBeInZone('hand', context.player2);

                // Swoop Racer is rescued and should enter play ready
                expect(context.swoopRacer).toBeInZone('groundArena', context.player1);
                expect(context.swoopRacer.exhausted).toBeFalse();
            });

            it('friendly units rescued from a friendly captor enter play ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        groundArena: ['swoop-racer'],
                        hand: ['cantina-bouncer', 'l337#droid-revolutionary']
                    }
                });

                const { context } = contextRef;

                // Use DJ's ability to play Cantina Bouncer, having Swoop Racer capture it
                context.player1.clickCard(context.dj);
                context.player1.clickPrompt(friendlyUnitPrompt);
                context.player1.clickCard(context.swoopRacer);
                context.player1.clickCard(context.cantinaBouncer);
                context.player1.clickPrompt('Pass');
                expect(context.cantinaBouncer).toBeCapturedBy(context.swoopRacer);

                context.player2.passAction();

                // Deploy DJ
                context.player1.clickCard(context.dj);
                context.player1.clickPrompt('Deploy DJ');
                context.player2.passAction();

                // Play L3-37 to rescue Cantina Bouncer
                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.cantinaBouncer);

                // Cantina Bouncer is rescued and should enter play ready
                expect(context.cantinaBouncer).toBeInZone('groundArena', context.player1);
                expect(context.cantinaBouncer.exhausted).toBeFalse();
            });

            it('friendly units rescued from a base captor enter play ready', async function () {
                pending('Needs base capture UI to be implemented on the client');

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'dj#need-a-lift',
                            deployed: true
                        },
                        groundArena: ['cantina-bouncer']
                    },
                    player2: {
                        hand: ['arrest'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 plays Arrest to have their base capture Cantina Bouncer
                context.player2.clickCard(context.arrest);
                context.player2.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer).toBeCapturedBy(context.p2Base);

                // Move to regroup phase to trigger the rescue
                context.moveToRegroupPhase();

                // Cantina Bouncer is rescued and should enter play ready
                expect(context.cantinaBouncer).toBeInZone('groundArena', context.player1);
                expect(context.cantinaBouncer.exhausted).toBeFalse();
            });

            it('enemy units rescued from a friendly captor do not enter play ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'dj#need-a-lift',
                            deployed: true
                        },
                        hand: ['discerning-veteran']
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // P1 plays Discerning Veteran and captures AT-ST
                context.player1.clickCard(context.discerningVeteran);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);

                // P2 plays Waylay to return Discerning Veteran to P1's hand
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.discerningVeteran);
                expect(context.discerningVeteran).toBeInZone('hand', context.player1);

                // AT-ST is rescued but should enter play exhausted
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.atst.exhausted).toBeTrue();
            });

            it('enemy units rescued from an enemy captor do not enter play ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'dj#need-a-lift',
                            deployed: true
                        },
                        hand: ['discerning-veteran', 'cantina-bouncer']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // P1 plays Discerning Veteran and captures AT-ST
                context.player1.clickCard(context.discerningVeteran);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);

                // P2 plays Change of Heart to take control of Discerning Veteran
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.discerningVeteran);
                expect(context.discerningVeteran).toBeInZone('groundArena', context.player2);

                // P1 plays Cantina Bouncer to return Discerning Veteran to P1's hand
                context.player1.clickCard(context.cantinaBouncer);
                context.player1.clickCard(context.discerningVeteran);
                expect(context.discerningVeteran).toBeInZone('hand', context.player1);

                // AT-ST is rescued but should enter play exhausted
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.atst.exhausted).toBeTrue();
            });
        });
    });
});