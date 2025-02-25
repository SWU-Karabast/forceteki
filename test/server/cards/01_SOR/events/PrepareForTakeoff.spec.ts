describe('Prepare for Takeoff', function () {
    integration(function (contextRef) {
        describe('Prepare for Takeoff\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['prepare-for-takeoff'],
                        deck: ['green-squadron-awing', 'battlefield-marine', 'restored-arc170', 'pyke-sentinel', 'inferno-four#unforgetting', 'escort-skiff', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                    },
                });
            });

            it('should prompt to choose up to 2 units from the top 8 cards, reveal them, draw them, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.prepareForTakeoff);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.greenSquadronAwing, context.restoredArc170, context.infernoFour, context.escortSkiff],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.greenSquadronAwing);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.greenSquadronAwing],
                    selectable: [context.restoredArc170, context.infernoFour, context.escortSkiff],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.restoredArc170);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.greenSquadronAwing, context.restoredArc170],
                    selectable: [context.infernoFour, context.escortSkiff],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // one click to confirm that additional cards can't be selected
                context.player1.clickCardInDisplayCardPrompt(context.infernoFour, true);

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Green Squadron A-Wing and Restored ARC-170');
                expect(context.greenSquadronAwing).toBeInZone('hand');
                expect(context.restoredArc170).toBeInZone('hand');

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 6);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 6);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 6);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 6);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 6);
                expect(context.escortSkiff).toBeInBottomOfDeck(context.player1, 6);
            });

            it('should prompt to choose up to 2 units from the top 8 cards, pick one, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.prepareForTakeoff);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.greenSquadronAwing, context.restoredArc170, context.infernoFour, context.escortSkiff],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.greenSquadronAwing);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.greenSquadronAwing],
                    selectable: [context.restoredArc170, context.infernoFour, context.escortSkiff],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Green Squadron A-Wing');
                expect(context.greenSquadronAwing).toBeInZone('hand');

                expect(context.restoredArc170).toBeInBottomOfDeck(context.player1, 7);
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 7);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 7);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 7);
                expect(context.escortSkiff).toBeInBottomOfDeck(context.player1, 7);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.prepareForTakeoff);
                context.player1.clickPrompt('Take nothing');

                expect([
                    context.greenSquadronAwing,
                    context.restoredArc170,
                    context.battlefieldMarine,
                    context.pykeSentinel,
                    context.consularSecurityForce,
                    context.echoBaseDefender,
                    context.infernoFour,
                    context.escortSkiff,
                ]).toAllBeInBottomOfDeck(context.player1, 8);
            });
        });
    });
});
