describe('Plot keyword', function() {
    integration(function(contextRef) {
        describe('When a leader is deployed', function() {
            it('should not allow enemy cards with Plot to be played when deploying friendly leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        resources: 10
                    },
                    player2: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        resources: ['wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'dogmatic-shock-squad'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.calKestis).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            it('a Plot upgrade may be played from resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.player1).toHavePassAbilityPrompt('Play Sneaking Suspicion using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.calKestis]);
                context.player1.clickCard(context.calKestis);
                expect(context.sneakingSuspicion).toBeAttachedTo(context.calKestis);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player2).toBeActivePlayer();
            });

            it('a Plot unit may be played from resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        resources: ['dogmatic-shock-squad', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Deploy Iden Versio');
                context.player1.clickPrompt('Shielded');
                expect(context.player1).toHavePassAbilityPrompt('Play Dogmatic Shock Squad using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player2).toBeActivePlayer();
            });

            it('a Plot event may be played from resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        resources: ['topple-the-summit', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        spaceArena: [{ card: 'alliance-xwing', damage: 1 }],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett');
                expect(context.player1).toHavePassAbilityPrompt('Play Topple The Summit using Plot');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);

                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.bobaFett.damage).toBe(0);
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.lukeSkywalker.damage).toBe(0);
            });

            it('Plot should work even if there is no card to replace it with from the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.player1).toHavePassAbilityPrompt('Play Sneaking Suspicion using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.calKestis]);
                context.player1.clickCard(context.calKestis);
                expect(context.sneakingSuspicion).toBeAttachedTo(context.calKestis);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('a triggered Plot that cannot be paid should not resource a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        resources: [{ card: 'sneaking-suspicion', exhausted: true }, { card: 'wampa', exhausted: true }, { card: 'wampa', exhausted: true }, { card: 'wampa', exhausted: true }],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve triggers from each card as they are played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        resources: ['dogmatic-shock-squad', 'cad-bane#impressed-now', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Deploy Iden Versio');
                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Play Cad Bane using Plot', 'Shielded']);

                // Resolve Cad Banea
                context.player1.clickPrompt('Play Cad Bane using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.cadBane).toBeInZone('groundArena');
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player1).toHavePrompt('Defeat a unit with 2 or less remaining HP');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Shielded']);
                context.player1.clickPrompt('Shielded');
                context.player1.clickPrompt('Trigger');
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');
                expect(context.moistureFarmer).toBeInZone('resource');

                expect(context.player1.exhaustedResourceCount).toBe(11);

                expect(context.player2).toBeActivePlayer();
            });

            it('should interact properly with Krayt Dragon', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        resources: ['dogmatic-shock-squad', 'cad-bane#impressed-now', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }, 'krayt-dragon']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Deploy Iden Versio');
                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Play Cad Bane using Plot', 'Shielded']);

                // Resolve Cad Banea
                context.player1.clickPrompt('Play Cad Bane using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.cadBane).toBeInZone('groundArena');
                expect(context.pykeSentinel).toBeInZone('resource');

                // Because of Krayt, we have to choose resolution order
                context.player1.clickPrompt('You');
                expect(context.player1).toHavePrompt('Defeat a unit with 2 or less remaining HP');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.cadBane, context.idenVersio]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(5);

                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Shielded']);
                context.player1.clickPrompt('Shielded');
                context.player1.clickPrompt('Trigger');
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');
                expect(context.moistureFarmer).toBeInZone('resource');

                expect(context.player1.exhaustedResourceCount).toBe(11);

                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.dogmaticShockSquad, context.cadBane, context.idenVersio]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(11);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to pass on Plot cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        resources: ['dogmatic-shock-squad', 'cad-bane#impressed-now', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Deploy Iden Versio');
                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Play Cad Bane using Plot', 'Shielded']);

                // Resolve Cad Banea
                context.player1.clickPrompt('Play Cad Bane using Plot');
                context.player1.clickPrompt('Pass');
                expect(context.cadBane).toBeInZone('resource');

                expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Shielded']);
                context.player1.clickPrompt('Shielded');
                context.player1.clickPrompt('Trigger');
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');
                expect(context.pykeSentinel).toBeInZone('resource');

                expect(context.player1.exhaustedResourceCount).toBe(6);

                expect(context.player2).toBeActivePlayer();
            });

            it('and is deploying as a Pilot, Plot should work', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        base: 'chopper-base',
                        spaceArena: ['cartel-spacer'],
                        resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.lukeSkywalker).toBeAttachedTo(context.cartelSpacer);
                expect(context.player1).toHavePassAbilityPrompt('Play Sneaking Suspicion using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.sneakingSuspicion).toBeAttachedTo(context.cartelSpacer);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player2).toBeActivePlayer();
            });

            it('friendly resources that are owned by the opponent should be playable using Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        base: 'chopper-base',
                        resources: [
                            'dj#blatant-thief',
                            'wampa',
                            'moment-of-peace',
                            'battlefield-marine',
                            'collections-starhopper',
                            'resilient',
                            'mercenary-company',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                        ],
                        deck: ['moisture-farmer', 'pyke-sentinel']
                    },
                    player2: {
                        resources: ['topple-the-summit'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dj);
                expect(context.toppleTheSummit).toBeInZone('resource', context.player1);
                expect(context.moistureFarmer).toBeInZone('resource');
                expect(context.player1.exhaustedResourceCount).toBe(7);

                context.player2.passAction();

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.player1).toHavePassAbilityPrompt('Play Topple The Summit using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1.exhaustedResourceCount).toBe(14); // 5 + penalty
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Plot cards should not be playable directly from the resource row', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'cal-kestis#i-cant-keep-hiding',
                    resources: ['wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'tala-durith#i-can-get-you-inside'],
                },
                player2: {
                    leader: 'iden-versio#inferno-squad-commander',
                    resources: 10
                },
            });

            const { context } = contextRef;

            expect(context.player1).toBeAbleToSelectExactly([context.calKestis]);
            expect(context.talaDurith).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.passAction();

            expect(context.player2).toBeAbleToSelectExactly([context.idenVersio]);
            expect(context.talaDurith).not.toHaveAvailableActionWhenClickedBy(context.player2);
        });

        it('Plot should work with Trench multi-deploy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'admiral-trench#chkchkchkchk',
                    base: 'kestro-city',
                    resources: ['dogmatic-shock-squad', 'cad-bane#impressed-now', 'topple-the-summit', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                    deck: []
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }],
                    hand: ['rivals-fall', 'takedown']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.admiralTrench);
            context.player1.clickPrompt('Deploy Admiral Trench');
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Play Cad Bane using Plot', 'Play Topple the Summit using Plot',
                '(No effect) Reveal the top 4 cards of your deck. An opponent discards 2 of them. Draw 1 of the remaining cards and discard the other']);

            // Resolve Topple the Summit
            context.player1.clickPrompt('Play Topple the Summit using Plot');
            context.player1.clickPrompt('Trigger');
            expect(context.player1.exhaustedResourceCount).toBe(7); // This is one less than normal because the Topple the Summit was not replaced due to the empty deck
            expect(context.battlefieldMarine).toBeInZone('discard');

            // Resolve Cad Bane
            context.player1.clickPrompt('Play Cad Bane using Plot');
            context.player1.clickPrompt('Pass');
            expect(context.cadBane).toBeInZone('resource');

            // Resolve Dogmatic Shock Squad
            context.player1.clickPrompt('Play Dogmatic Shock Squad using Plot');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.admiralTrench);

            context.moveToNextActionPhase();

            // Deploy Trench again to verify unplayed Plots work
            context.player1.clickCard(context.admiralTrench);
            context.player1.clickPrompt('Deploy Admiral Trench');
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player1).toHaveExactPromptButtons(['Play Dogmatic Shock Squad using Plot', 'Play Cad Bane using Plot',
                '(No effect) Reveal the top 4 cards of your deck. An opponent discards 2 of them. Draw 1 of the remaining cards and discard the other']);

            // Resolve Cad Bane
            context.player1.clickPrompt('Play Cad Bane using Plot');
            context.player1.clickPrompt('Pass');
            expect(context.cadBane).toBeInZone('resource');

            // Resolve Dogmatic Shock Squad
            context.player1.clickPrompt('Play Dogmatic Shock Squad using Plot');
            context.player1.clickPrompt('Trigger');
            expect(context.dogmaticShockSquad).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(10); // This is one less than normal because the Dogmatic Shock Squad was not replaced due to the empty deck

            expect(context.player2).toBeActivePlayer();
        });

        it('Plot should not be triggered by a leader that flips but does not Deploy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chancellor-palpatine#playing-both-sides',
                    groundArena: ['battlefield-marine'],
                    resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                },
                player2: {
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.battlefieldMarine);

            // Check that Palpatine healed, drew, and flipped
            context.player1.clickCard(context.chancellorPalpatine);
            expect(context.chancellorPalpatine.exhausted).toBe(true);
            expect(context.chancellorPalpatine.onStartingSide).toBe(false);

            expect(context.player2).toBeActivePlayer();
        });

        it('Plot should not be triggered by a leader that attaches but does not Deploy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'poe-dameron#i-can-fly-anything',
                    spaceArena: [{ card: 'cartel-spacer', upgrades: ['r2d2#artooooooooo'] }, 'tie-bomber'],
                    groundArena: ['reinforcement-walker'],
                    resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poeDameron);
            context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');

            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker, context.tieBomber]);

            context.player1.clickCard(context.reinforcementWalker);

            expect(context.reinforcementWalker).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
