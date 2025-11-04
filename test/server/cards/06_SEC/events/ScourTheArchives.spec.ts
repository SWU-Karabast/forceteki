describe('Scour The Archives', function () {
    integration(function (contextRef) {
        describe('Scour The Archive\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scour-the-archives'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'supercommando-squad', 'protector', 'inferno-four#unforgetting', 'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                    },
                });
            });

            it('should prompt to choose an Upgrade from the top 8 cards, reveal them, draw them, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scourTheArchives);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.supercommandoSquad],
                    selectable: [context.protector, context.devotion]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devotion);

                expect(context.getChatLogs(2)).toContain('player1 takes Devotion');
                expect(context.devotion).toBeInZone('hand');

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.supercommandoSquad).toBeInBottomOfDeck(context.player1, 7);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 7);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 7);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 7);
                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 7);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scourTheArchives);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.supercommandoSquad],
                    selectable: [context.protector, context.devotion]
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