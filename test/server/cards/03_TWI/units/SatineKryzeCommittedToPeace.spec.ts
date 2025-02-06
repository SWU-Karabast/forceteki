
describe('Satine Kryze, Committed To Peace', function () {
    integration(function (contextRef) {
        it('Satine Kryze\'s ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['satine-kryze#committed-to-peace', 'battlefield-marine'],
                    deck: 20
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }],
                    deck: 20
                }
            });

            const { context } = contextRef;

            // Check that both players' units have the mill ability
            context.player1.clickCard(context.satineKryze);
            expect(context.player1).toHaveExactPromptButtons(['Attack', 'Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up', 'Cancel']);
            context.player1.clickPrompt('Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up');
            expect(context.satineKryze.exhausted).toBe(true);
            expect(context.player2.deck.length).toBe(17);

            context.player2.clickCard(context.wampa);
            expect(context.player2).toHaveExactPromptButtons(['Attack', 'Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up', 'Cancel']);
            context.player2.clickPrompt('Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up');
            expect(context.wampa.exhausted).toBe(true);
            expect(context.player1.deck.length).toBe(16);

            context.moveToNextActionPhase();

            // Check that you cannot trigger the mill ability on opponent's units or on upgrades
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.passAction();
            expect(context.satineKryze).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(context.entrenched).not.toHaveAvailableActionWhenClickedBy(context.player2);

            // Check that the mill ability disappears when Satine leaves play
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.satineKryze);
            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player2.clickCard(context.battlefieldMarine);
        });
    });
});
