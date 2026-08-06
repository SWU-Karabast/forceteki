describe('Admiral Ackbar, Assume Attack Coordinates', function () {
    integration(function (contextRef) {
        describe('Admiral Ackbar\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-ackbar#assume-attack-coordinates'],
                        spaceArena: ['awing'],
                        deck: [
                            'tieln-fighter', 'phoenix-squadron-awing',
                            'lurking-tie-phantom', 'battlefield-marine',
                            'screeching-tie-fighter', 'devastator#hunting-the-rebellion',
                            'protector', 'devastating-gunship',
                            'bt1#blastomech', 'atst', 'yoda#old-master'
                        ],
                        base: 'echo-base',
                        leader: 'boba-fett#any-methods-necessary'
                    }
                });
            });

            it('should search the top 10 cards and play Space units with total cost <= 5 for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbarAssumeAttackCoordinates);
                expect(context.player1).toHavePassAbilityPrompt('Defeat this unit. If you do, search the top 10 cards of your deck for any number of space units with combined cost 5 or less and play each of them for free.');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Choose any Space units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.tielnFighter, context.devastatingGunship, context.phoenixSquadronAwing, context.lurkingTiePhantom, context.screechingTieFighter],
                    invalid: [context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.lurkingTiePhantom);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    usesSelectionOrder: true,
                    selectable: [context.screechingTieFighter, context.tielnFighter, context.phoenixSquadronAwing],
                    selected: [context.lurkingTiePhantom],
                    unselectable: [context.devastatingGunship],
                    invalid: [context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1]
                });
                context.player1.clickCardInDisplayCardPrompt(context.screechingTieFighter);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    usesSelectionOrder: true,
                    selectable: [context.tielnFighter],
                    selected: [context.lurkingTiePhantom, context.screechingTieFighter],
                    unselectable: [context.devastatingGunship, context.phoenixSquadronAwing],
                    invalid: [context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1]
                });
                context.player1.clickCardInDisplayCardPrompt(context.tielnFighter);
                context.player1.clickPrompt('Play cards in selection order');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.tielnFighter).toBeInZone('spaceArena', context.player1);
                expect(context.screechingTieFighter).toBeInZone('spaceArena', context.player1);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player1);
                expect([context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1, context.devastatingGunship, context.phoenixSquadronAwing]).toAllBeInBottomOfDeck(context.player1, 7);
            });

            it('should search the top 10 cards and play Space units with total cost <= 5 for free (ignore aspect penalties)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbarAssumeAttackCoordinates);
                expect(context.player1).toHavePassAbilityPrompt('Defeat this unit. If you do, search the top 10 cards of your deck for any number of space units with combined cost 5 or less and play each of them for free.');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Choose any Space units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.tielnFighter, context.devastatingGunship, context.phoenixSquadronAwing, context.lurkingTiePhantom, context.screechingTieFighter],
                    invalid: [context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.lurkingTiePhantom);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    usesSelectionOrder: true,
                    selectable: [context.screechingTieFighter, context.tielnFighter, context.phoenixSquadronAwing],
                    selected: [context.lurkingTiePhantom],
                    unselectable: [context.devastatingGunship],
                    invalid: [context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1]
                });
                context.player1.clickCardInDisplayCardPrompt(context.phoenixSquadronAwing);

                context.player1.clickPrompt('Play cards in selection order');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.phoenixSquadronAwing).toBeInZone('spaceArena', context.player1);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player1);
                expect([context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1, context.devastatingGunship, context.screechingTieFighter, context.tielnFighter]).toAllBeInBottomOfDeck(context.player1, 8);
            });

            it('should allow the player to take nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbarAssumeAttackCoordinates);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Choose any Space units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([context.battlefieldMarine, context.devastator, context.protector, context.atst, context.bt1, context.devastatingGunship, context.screechingTieFighter, context.tielnFighter, context.lurkingTiePhantom, context.phoenixSquadronAwing]).toAllBeInBottomOfDeck(context.player1, 10);
            });

            it('should allow the player to pass', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbarAssumeAttackCoordinates);
                context.player1.clickPrompt('Pass');

                expect(context.player1.deck[0]).toBe(context.tielnFighter);
                expect(context.player1.deck[1]).toBe(context.phoenixSquadronAwing);
                expect(context.player1.deck[2]).toBe(context.lurkingTiePhantom);
                expect(context.player1.deck[3]).toBe(context.battlefieldMarine);
                expect(context.player1.deck[4]).toBe(context.screechingTieFighter);
                expect(context.player1.deck[5]).toBe(context.devastator);
                expect(context.player1.deck[6]).toBe(context.protector);
                expect(context.player1.deck[7]).toBe(context.devastatingGunship);
                expect(context.player1.deck[8]).toBe(context.bt1);
                expect(context.player1.deck[9]).toBe(context.atst);
                expect(context.player1.deck[10]).toBe(context.yoda);
            });
        });
    });
});