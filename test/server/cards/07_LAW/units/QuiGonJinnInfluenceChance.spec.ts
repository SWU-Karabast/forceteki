
describe('Qui-Gon Jinn Influence Chance', function () {
    integration(function (contextRef) {
        it('on attack, should look at the top 3 cards of your deck, discard 1, put the rest on top in any order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers', 'qui-gon-jinn#influence-chance'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter', 'force-throw'],
                    deck: ['ma-klounkee', 'porg', 'underworld-thug', 'moisture-farmer', 'tieln-fighter'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quiGonJinnInfluenceChance);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Select a card to discard');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.porg, context.underworldThug] });

            context.player1.clickCardInDisplayCardPrompt(context.porg);

            expect(context.player1).toHavePrompt('Place cards on top of the deck in any order');
            expect(context.player1).not.toBeAbleToSelect(context.porg);

            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.underworldThug] });

            context.player1.clickDisplayCardPromptButton(context.maKlounkee.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.underworldThug.uuid, 'top');

            expect(context.porg).toBeInZone('discard');
            expect(context.maKlounkee).toBeInZone('deck');
            expect(context.underworldThug).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('when played, should look at the top 3 cards of your deck, discard 1, put the rest on top in any order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter'],
                    deck: ['ma-klounkee', 'porg', 'force-throw', 'moisture-farmer', 'tieln-fighter'],
                    resources: 10,
                    hand: ['qui-gon-jinn#influence-chance']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quiGonJinnInfluenceChance);

            expect(context.player1).toHavePrompt('Select a card to discard');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.porg, context.forceThrow] });

            context.player1.clickCardInDisplayCardPrompt(context.porg);

            expect(context.player1).toHavePrompt('Place cards on top of the deck in any order');
            expect(context.player1).not.toBeAbleToSelect(context.porg);

            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.forceThrow] });

            context.player1.clickDisplayCardPromptButton(context.maKlounkee.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.forceThrow.uuid, 'top');

            expect(context.porg).toBeInZone('discard');
            expect(context.maKlounkee).toBeInZone('deck');
            expect(context.forceThrow).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('should allow the user to not discard a card, but still make them put all 3 on top of the deck in any order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers', 'qui-gon-jinn#influence-chance'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter', 'force-throw'],
                    deck: ['ma-klounkee', 'porg', 'underworld-thug', 'moisture-farmer', 'tieln-fighter'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quiGonJinnInfluenceChance);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Select a card to discard');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.porg, context.underworldThug] });

            context.player1.clickPrompt('Take nothing');


            context.player1.clickDisplayCardPromptButton(context.maKlounkee.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.underworldThug.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.porg.uuid, 'top');

            expect(context.porg).toBeInZone('deck');
            expect(context.maKlounkee).toBeInZone('deck');
            expect(context.underworldThug).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('should function as expected with less than 3 cards in deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers', 'qui-gon-jinn#influence-chance'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter', 'force-throw'],
                    deck: ['ma-klounkee', 'porg'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quiGonJinnInfluenceChance);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Select a card to discard');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee, context.porg] });

            context.player1.clickCardInDisplayCardPrompt(context.porg);

            expect(context.player1).toHavePrompt('Place cards on top of the deck in any order');
            expect(context.player1).not.toBeAbleToSelect(context.porg);

            expect(context.player1).toHaveExactDisplayPromptCards({ selectable: [context.maKlounkee] });

            context.player1.clickDisplayCardPromptButton(context.maKlounkee.uuid, 'top');

            expect(context.porg).toBeInZone('discard');
            expect(context.maKlounkee).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('should function as expected when the deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers', 'qui-gon-jinn#influence-chance'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter', 'force-throw'],
                    deck: [],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quiGonJinnInfluenceChance);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});