describe('Annihilator, Tagge\'s Flagship', function() {
    integration(function(contextRef) {
        describe('Annihilator\'s When Played ability', function() {
            it('should defeat an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.annihilator);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('can choose to not defeat a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.annihilator);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
            });

            it('should do nothing if there are no enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.annihilator);
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit and discard a card with the same name from the opponent\'s hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa'],
                        hand: ['wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                const inPlayWampa = context.player2.findCardByName('wampa', 'groundArena');
                const inHandWampa = context.player2.findCardByName('wampa', 'hand');

                context.player1.clickCard(context.annihilator);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([inPlayWampa, context.battlefieldMarine]);
                context.player1.clickCard(inPlayWampa);
                expect(inPlayWampa).toBeInZone('discard');

                // Player sees the opponent's hand
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    inHandWampa
                ]);
                context.player1.clickPrompt('Done');

                expect(inHandWampa).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['boba-fett#disintegrator', 'wampa'],
                        hand: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                const inPlayBoba = context.player2.findCardByName('boba-fett#disintegrator', 'groundArena');
                const inHandBoba = context.player2.findCardByName('boba-fett#disintegrator', 'hand');
                const inHandPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'hand');

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(inPlayBoba);
                expect(inPlayBoba).toBeInZone('discard');

                // Player sees the opponent's hand
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    inHandBoba,
                    inHandPilotBoba,
                    context.cartelSpacer
                ]);
                context.player1.clickPrompt('Done');

                expect(inHandBoba).toBeInZone('discard');
                expect(inHandPilotBoba).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit and discard all cards with the same name from the opponent\'s deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['boba-fett#disintegrator', 'wampa'],
                        deck: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                const inPlayBoba = context.player2.findCardByName('boba-fett#disintegrator', 'groundArena');
                const inDeckBoba = context.player2.findCardByName('boba-fett#disintegrator', 'deck');
                const inDeckPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'deck');

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(inPlayBoba);
                expect(inPlayBoba).toBeInZone('discard');

                // TODO: these are commented out pending some fixes for the FE prompt for this
                // // Player sees the opponent's deck
                // expect(context.player1).toHaveExactDisplayPromptCards({
                //     selectable: [inDeckBoba, inDeckPilotBoba],
                //     invalid: [context.cartelSpacer]
                // });

                // expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                // expect(context.player2).toHavePrompt('Waiting for opponent to use Annihilator');

                // context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
                // expect(context.player1).toHaveEnabledPromptButton('Done');

                // context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
                // context.player1.clickPrompt('Done');

                expect(inDeckBoba).toBeInZone('discard');
                expect(inDeckPilotBoba).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand and deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        leader: { card: 'boba-fett#any-methods-necessary', deployed: true },
                        groundArena: ['boba-fett#disintegrator', 'wampa'],
                        hand: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-turncoat'],
                        deck: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                const player2LeaderBoba = context.player2.findCardByName('boba-fett#any-methods-necessary', 'groundArena');
                const inPlayBoba = context.player2.findCardByName('boba-fett#disintegrator', 'groundArena');
                const inHandBoba = context.player2.findCardByName('boba-fett#disintegrator', 'hand');
                const inHandPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'hand');
                const inDeckBoba = context.player2.findCardByName('boba-fett#disintegrator', 'deck');
                const inDeckPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'deck');

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(player2LeaderBoba);
                expect(player2LeaderBoba).toBeInZone('base');

                // Player sees the opponent's hand
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    inHandBoba,
                    inHandPilotBoba,
                    context.cartelTurncoat
                ]);
                context.player1.clickPrompt('Done');

                expect(inHandBoba).toBeInZone('discard');
                expect(inHandPilotBoba).toBeInZone('discard');

                // TODO: these are commented out pending some fixes for the FE prompt for this
                // // Player sees the opponent's deck
                // expect(context.player1).toHaveExactDisplayPromptCards({
                //     selectable: [inDeckBoba, inDeckPilotBoba],
                //     invalid: [context.cartelSpacer]
                // });

                // expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                // expect(context.player2).toHavePrompt('Waiting for opponent to use Annihilator');

                // context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
                // expect(context.player1).toHaveEnabledPromptButton('Done');

                // context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
                // context.player1.clickPrompt('Done');

                expect(inDeckBoba).toBeInZone('discard');
                expect(inDeckPilotBoba).toBeInZone('discard');

                expect(inPlayBoba).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            // TODO: fix this test once Lurking TIE is using replacement effects
            // it('should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand and deck', async function() {
            //     pending('This test is failing because Lurking TIE is not being treated as a replacement effect');
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['annihilator#tagges-flagship'],
            //             spaceArena: ['concord-dawn-interceptors'],
            //             deck: ['battlefield-marine']
            //         },
            //         player2: {
            //             spaceArena: ['lurking-tie-phantom'],
            //             hand: ['lurking-tie-phantom', 'cartel-turncoat'],
            //             deck: ['lurking-tie-phantom', 'cartel-spacer']
            //         }
            //     });

            //     const { context } = contextRef;

            //     const inPlayLurkingTIE = context.player2.findCardByName('lurking-tie-phantom', 'spaceArena');
            //     const inHandLurkingTIE = context.player2.findCardByName('lurking-tie-phantom', 'hand');
            //     const inDeckLurkingTIE = context.player2.findCardByName('lurking-tie-phantom', 'deck');

            //     context.player1.clickCard(context.annihilator);
            //     context.player1.clickCard(inPlayLurkingTIE);
            //     expect(inPlayLurkingTIE).toBeInZone('spaceArena');

            //     // Player sees the opponent's hand
            //     expect(context.player1).toHaveEnabledPromptButton('Done');
            //     expect(context.player1).toHaveExactViewableDisplayPromptCards([
            //         inHandLurkingTIE,
            //         context.cartelTurncoat
            //     ]);
            //     context.player1.clickPrompt('Done');

            //     expect(inHandLurkingTIE).toBeInZone('discard');

            //     // Player sees the opponent's deck
            //     expect(context.player1).toHaveExactDisplayPromptCards({
            //         selectable: [inDeckLurkingTIE],
            //         invalid: [context.cartelSpacer]
            //     });

            //     expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            //     expect(context.player2).toHavePrompt('Waiting for opponent to use Annihilator');

            //     context.player1.clickCardInDisplayCardPrompt(inDeckLurkingTIE);
            //     context.player1.clickPrompt('Done');

            //     expect(inDeckLurkingTIE).toBeInZone('discard');

            //     expect(context.player2).toBeActivePlayer();
            // });

            it('should be able to choose not to discard some card from the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        leader: { card: 'boba-fett#any-methods-necessary', deployed: true },
                        hand: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-turncoat'],
                        deck: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                const player2LeaderBoba = context.player2.findCardByName('boba-fett#any-methods-necessary', 'groundArena');
                const inHandBoba = context.player2.findCardByName('boba-fett#disintegrator', 'hand');
                const inHandPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'hand');
                const inDeckBoba = context.player2.findCardByName('boba-fett#disintegrator', 'deck');
                // const inDeckPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'deck'); see below TODO

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(player2LeaderBoba);

                context.player1.clickPrompt('Done');

                expect(inHandBoba).toBeInZone('discard');
                expect(inHandPilotBoba).toBeInZone('discard');

                // TODO: these are commented out pending some fixes for the FE prompt for this
                // // Player sees the opponent's deck
                // expect(context.player1).toHaveExactDisplayPromptCards({
                //     selectable: [inDeckBoba, inDeckPilotBoba],
                //     invalid: [context.cartelSpacer]
                // });

                // context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
                // expect(context.player1).toHaveEnabledPromptButton('Done');
                // context.player1.clickPrompt('Done');

                expect(inDeckBoba).toBeInZone('discard');
                // expect(inDeckPilotBoba).toBeInZone('deck'); see above TODO
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Annihilator\'s when defeated ability should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand and deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['annihilator#tagges-flagship', 'concord-dawn-interceptors'],
                    deck: ['battlefield-marine']
                },
                player2: {
                    leader: { card: 'boba-fett#any-methods-necessary', deployed: true },
                    groundArena: ['boba-fett#disintegrator', 'wampa'],
                    hand: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-turncoat', 'rivals-fall'],
                    deck: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer']
                }
            });

            const { context } = contextRef;

            const player2LeaderBoba = context.player2.findCardByName('boba-fett#any-methods-necessary', 'groundArena');
            const inPlayBoba = context.player2.findCardByName('boba-fett#disintegrator', 'groundArena');
            const inHandBoba = context.player2.findCardByName('boba-fett#disintegrator', 'hand');
            const inHandPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'hand');
            const inDeckBoba = context.player2.findCardByName('boba-fett#disintegrator', 'deck');
            const inDeckPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'deck');

            // Player 2 defeats Annihilator
            context.player1.passAction();
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.annihilator);

            // Choose player 2 Boba Fett leader
            expect(context.player1).toBeAbleToSelectExactly([player2LeaderBoba, context.wampa, inPlayBoba]);
            context.player1.clickCard(player2LeaderBoba);
            expect(player2LeaderBoba).toBeInZone('base');

            // Discard Bobas from hand
            expect(context.player1).toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveExactViewableDisplayPromptCards([
                inHandBoba,
                inHandPilotBoba,
                context.cartelTurncoat
            ]);
            context.player1.clickPrompt('Done');

            expect(inHandBoba).toBeInZone('discard');
            expect(inHandPilotBoba).toBeInZone('discard');

            // TODO: these are commented out pending some fixes for the FE prompt for this
            // // Search deck for Bobas
            // expect(context.player1).toHaveExactDisplayPromptCards({
            //     selectable: [inDeckBoba, inDeckPilotBoba],
            //     invalid: [context.cartelSpacer]
            // });

            // context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
            // expect(context.player1).toHaveEnabledPromptButton('Done');

            // context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
            // context.player1.clickPrompt('Done');

            expect(inDeckBoba).toBeInZone('discard');
            expect(inDeckPilotBoba).toBeInZone('discard');
            expect(inPlayBoba).toBeInZone('groundArena');

            expect(context.player1).toBeActivePlayer();
        });

        it('Annihilator\'s when defeated ability should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand and deck even if the defeat event was replaced', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['annihilator#tagges-flagship'],
                    deck: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['l337#get-out-of-my-seat', 'atst'],
                    hand: ['l337#droid-revolutionary', 'l337#get-out-of-my-seat', 'cartel-turncoat', 'rivals-fall'],
                    deck: ['l337#droid-revolutionary', 'l337#get-out-of-my-seat', 'cartel-spacer']
                }
            });

            const { context } = contextRef;

            const inPlayL337 = context.player2.findCardByName('l337#get-out-of-my-seat', 'groundArena');
            const inHandL337 = context.player2.findCardByName('l337#droid-revolutionary', 'hand');
            const inDeckL337 = context.player2.findCardByName('l337#droid-revolutionary', 'deck');
            const inHandL337Pilot = context.player2.findCardByName('l337#get-out-of-my-seat', 'hand');
            const inDeckL337Pilot = context.player2.findCardByName('l337#get-out-of-my-seat', 'deck');

            context.player1.clickCard(context.annihilator);
            context.player1.clickCard(inPlayL337);
            context.player2.clickPrompt('Trigger');
            context.player2.clickCard(context.atst);
            context.player1.clickPrompt('Done');

            expect(context.atst).toHaveExactUpgradeNames(['l337#get-out-of-my-seat']);
            expect(inPlayL337).toBeInZone('groundArena');
            expect(inHandL337).toBeInZone('discard');
            expect(inDeckL337).toBeInZone('discard');
            expect(inHandL337Pilot).toBeInZone('discard');
            expect(inDeckL337Pilot).toBeInZone('discard');
        });
    });
});
