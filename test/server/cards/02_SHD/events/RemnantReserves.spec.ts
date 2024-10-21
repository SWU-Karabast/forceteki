describe('Remnant Reserves', function () {
    integration(function (contextRef) {
        describe('Remnant Reserves\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['remnant-reserves'],
                        deck: ['green-squadron-awing', 'recruit', 'restored-arc170', 'prepare-for-takeoff', 'inferno-four#unforgetting', 'escort-skiff'],
                    },
                });
            });

            it('should prompt to choose up to 3 units from the top 5 cards, reveal them, draw them, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.remnantReserves);
                expect(context.player1).toHavePrompt('Select up to 3 cards to reveal');
                expect(context.player1).toHaveDisabledPromptButtons([context.recruit.title, context.prepareForTakeoff.title]);
                expect(context.player1).toHaveEnabledPromptButtons([context.greenSquadronAwing.title, context.restoredArc170.title, context.infernoFour.title, 'Take nothing']);

                context.player1.clickPrompt(context.greenSquadronAwing.title);
                context.player1.clickPrompt(context.restoredArc170.title);
                context.player1.clickPrompt(context.infernoFour.title);
                expect(context.getChatLogs(2)).toContain('player1 takes Green Squadron A-Wing, Restored ARC-170, and Inferno Four');
                expect(context.greenSquadronAwing).toBeInLocation('hand');
                expect(context.restoredArc170).toBeInLocation('hand');
                expect(context.infernoFour).toBeInLocation('hand');

                expect(context.recruit).toBeInBottomOfDeck(context.player1, 2);
                expect(context.prepareForTakeoff).toBeInBottomOfDeck(context.player1, 2);
            });

            it('should prompt to choose up to 3 units from the top 5 cards, pick one, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.remnantReserves);
                expect(context.player1).toHavePrompt('Select up to 3 cards to reveal');
                expect(context.player1).toHaveDisabledPromptButtons([context.recruit.title, context.prepareForTakeoff.title]);
                expect(context.player1).toHaveEnabledPromptButtons([context.greenSquadronAwing.title, context.restoredArc170.title, context.infernoFour.title, 'Take nothing']);

                context.player1.clickPrompt(context.greenSquadronAwing.title);
                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Green Squadron A-Wing');
                expect(context.greenSquadronAwing).toBeInLocation('hand');

                expect(context.recruit).toBeInBottomOfDeck(context.player1, 4);
                expect(context.restoredArc170).toBeInBottomOfDeck(context.player1, 4);
                expect(context.prepareForTakeoff).toBeInBottomOfDeck(context.player1, 4);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 4);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.remnantReserves);
                context.player1.clickPrompt('Take nothing');

                expect([
                    context.greenSquadronAwing,
                    context.recruit,
                    context.restoredArc170,
                    context.prepareForTakeoff,
                    context.infernoFour,
                ]).toAllBeInBottomOfDeck(context.player1, 5);
            });
        });
    });
});
