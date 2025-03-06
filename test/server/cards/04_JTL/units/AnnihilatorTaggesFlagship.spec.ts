describe('Annihilator, Tagge\'s Flagship', function() {
    integration(function(contextRef) {
        it('Annihilator should defeat an enemy unit', async function() {
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

        it('Annihilator can choose to not defeat a unit', async function() {
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

        it('Annihilator should do nothing if there are no enemy units', async function() {
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

        it('Annihilator should defeat an enemy unit and discard a card with the same name from the opponent\'s hand', async function() {
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

        it('Annihilator should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand', async function() {
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

        it('Annihilator should defeat an enemy unit and discard all cards with the same name from the opponent\'s deck', async function() {
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

            // Player sees the opponent's deck
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [inDeckBoba, inDeckPilotBoba],
                invalid: [context.cartelSpacer]
            });

            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player2).toHavePrompt('Waiting for opponent to use Annihilator');

            context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
            context.player1.clickPrompt('Done');

            expect(inDeckBoba).toBeInZone('discard');
            expect(inDeckPilotBoba).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Annihilator should defeat an enemy unit and discard all cards with the same name from the opponent\'s hand and deck', async function() {
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

            // Player sees the opponent's deck
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [inDeckBoba, inDeckPilotBoba],
                invalid: [context.cartelSpacer]
            });

            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player2).toHavePrompt('Waiting for opponent to use Annihilator');

            context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
            context.player1.clickPrompt('Done');

            expect(inDeckBoba).toBeInZone('discard');
            expect(inDeckPilotBoba).toBeInZone('discard');

            expect(inPlayBoba).toBeInZone('groundArena');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
