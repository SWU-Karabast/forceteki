describe('This is the Way', function () {
    integration(function (contextRef) {
        describe('This is the Way\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['this-is-the-way'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'supercommando-squad', 'protector', 'inferno-four#unforgetting', 'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                    },
                });
            });

            it('should prompt to choose up to 2 Mandalorian cards from the top 8 cards, reveal them, draw them, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.thisIsTheWay);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.sabineWren, context.supercommandoSquad, context.protector, context.devotion]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devotion);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.sabineWren, context.supercommandoSquad, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.sabineWren);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion, context.sabineWren],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.supercommandoSquad, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Sabine Wren and Devotion');
                expect(context.sabineWren).toBeInZone('hand');
                expect(context.devotion).toBeInZone('hand');

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 6);
                expect(context.supercommandoSquad).toBeInBottomOfDeck(context.player1, 6);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 6);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 6);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 6);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 6);
            });

            it('should prompt to choose up to 2 Mandalorian cards from the top 8 cards, pick one, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.thisIsTheWay);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.sabineWren, context.supercommandoSquad, context.protector, context.devotion]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devotion);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.sabineWren, context.supercommandoSquad, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Devotion');
                expect(context.devotion).toBeInZone('hand');

                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 7);
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.supercommandoSquad).toBeInBottomOfDeck(context.player1, 7);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 7);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 7);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 7);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.thisIsTheWay);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender],
                    selectable: [context.sabineWren, context.supercommandoSquad, context.protector, context.devotion]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([
                    context.sabineWren,
                    context.battlefieldMarine,
                    context.supercommandoSquad,
                    context.protector,
                    context.infernoFour,
                    context.devotion,
                    context.consularSecurityForce,
                    context.echoBaseDefender,
                ]).toAllBeInBottomOfDeck(context.player1, 8);
            });
        });
    });
});
