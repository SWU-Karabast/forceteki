describe('Private Manufacturing', function () {
    integration(function (contextRef) {
        describe('Private Manufacturing\'s ability', function () {
            it('should draw two cards and not ask to move two cards to bottom of the deck because there is at least one token unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['private-manufacturing'],
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.privateManufacturing);
                expect(context.player1.hand.length).toBe(2);
            });

            it('should draw two cards and should ask to move two cards to bottom of the deck because there are no token units', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['private-manufacturing', 'republic-tactical-officer', 'advanced-recon-commando'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.privateManufacturing);
                expect(context.player1.hand.length).toBe(4);
                expect(context.player1).toHavePrompt('Select 2 cards');
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.advancedReconCommando);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(2);
                expect([context.republicTacticalOfficer, context.advancedReconCommando]).toAllBeInBottomOfDeck(context.player1, 2);
            });
        });
    });
});