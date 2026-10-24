describe('Trust Yourself', function() {
    integration(function(contextRef) {
        it('Should give a Shield token to a friendly unit, search the top 3 cards of the deck for a card, and draw it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trust-yourself'],
                    groundArena: ['battlefield-marine'],
                    deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trustYourself);
            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHavePrompt('Select a card');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [
                    context.confiscate,
                    context.deathStarPlans,
                    context.homeOne
                ]
            });
            context.player1.clickCardInDisplayCardPrompt(context.deathStarPlans);

            expect(context.deathStarPlans).toBeInZone('hand', context.player1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
        });

        it('can be used even if there are fewer than 3 cards in the deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trust-yourself'],
                    groundArena: ['battlefield-marine'],
                    deck: ['confiscate', 'death-star-plans']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trustYourself);
            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHavePrompt('Select a card');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [
                    context.confiscate,
                    context.deathStarPlans
                ]
            });
            context.player1.clickCardInDisplayCardPrompt(context.confiscate);

            expect(context.confiscate).toBeInZone('hand', context.player1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
        });

        it('can be used even if there are no cards in the deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trust-yourself'],
                    base: { card: 'echo-base', damage: 0 },
                    groundArena: ['battlefield-marine'],
                    deck: []
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trustYourself);
            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.p1Base.damage).toBe(0); // No draw damage due to search failing
            expect(context.player1.hand.length).toBe(0);
            expect(context.player1.deck.length).toBe(0);
        });

        it('Should still search even with no units in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trust-yourself'],
                    deck: ['confiscate', 'death-star-plans', 'home-one#alliance-flagship']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trustYourself);

            expect(context.player1).toHavePrompt('Select a card');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [
                    context.confiscate,
                    context.deathStarPlans,
                    context.homeOne
                ]
            });
            context.player1.clickCardInDisplayCardPrompt(context.deathStarPlans);

            expect(context.deathStarPlans).toBeInZone('hand', context.player1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});