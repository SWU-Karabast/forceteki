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

            // TODO Add a test with a Plot card in friendly resources that is owned by the opponent
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
    });
});
