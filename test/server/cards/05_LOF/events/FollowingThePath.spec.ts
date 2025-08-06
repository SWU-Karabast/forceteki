describe('Following The Path', function () {
    integration(function (contextRef) {
        describe('Following The Path\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['following-the-path'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'jedi-knight', 'secretive-sage', 'inferno-four#unforgetting', 'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                    },
                });
            });

            it('should prompt to choose up to 2 Force units from the top 8 cards, reveal them, put them on top in any order, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.followingThePath);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion],
                    selectable: [context.jediKnight, context.secretiveSage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.jediKnight);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.jediKnight],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion],
                    selectable: [context.secretiveSage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.secretiveSage);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.jediKnight, context.secretiveSage],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickDone();
                expect(context.getChatLogs(1)[0]).toContain(context.jediKnight.title);
                expect(context.getChatLogs(1)[0]).toContain(context.secretiveSage.title);

                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top']);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    context.jediKnight,
                    context.secretiveSage,
                ]);

                context.player1.clickDisplayCardPromptButton(context.jediKnight.uuid, 'top');
                context.player1.clickDisplayCardPromptButton(context.secretiveSage.uuid, 'top');

                expect(context.player1.deck[0]).toBe(context.secretiveSage);
                expect(context.player1.deck[1]).toBe(context.jediKnight);

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 6);
                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 6);
                expect(context.devotion).toBeInBottomOfDeck(context.player1, 6);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 6);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 6);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 6);
            });

            it('should prompt to choose up to 2 Force cards from the top 8 cards, pick one, reveal it, put it on top, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.followingThePath);
                expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion],
                    selectable: [context.jediKnight, context.secretiveSage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.jediKnight);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.jediKnight],
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion],
                    selectable: [context.secretiveSage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickDone();
                expect(context.getChatLogs(1)[0]).toContain(context.jediKnight.title);

                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top']);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    context.jediKnight,
                ]);

                context.player1.clickDisplayCardPromptButton(context.jediKnight.uuid, 'top');

                expect(context.player1.deck[0]).toBe(context.jediKnight);

                expect(context.secretiveSage).toBeInBottomOfDeck(context.player1, 7);
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 7);
                expect(context.devotion).toBeInBottomOfDeck(context.player1, 7);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 7);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 7);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.followingThePath);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.devotion],
                    selectable: [context.jediKnight, context.secretiveSage]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([
                    context.sabineWren,
                    context.battlefieldMarine,
                    context.jediKnight,
                    context.secretiveSage,
                    context.infernoFour,
                    context.devotion,
                    context.consularSecurityForce,
                    context.echoBaseDefender,
                ]).toAllBeInBottomOfDeck(context.player1, 8);
            });
        });
    });
});