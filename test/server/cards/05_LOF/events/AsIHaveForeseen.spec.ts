describe('As I Have Foreseen', function () {
    integration(function (contextRef) {
        describe('As I Have Foreseen\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'doctor-aphra#rapacious-archaeologist',
                        hasForceToken: true,
                        hand: ['as-i-have-foreseen'],
                        deck: [
                            'zuckuss#bounty-hunter-for-hire',
                            'underworld-thug',
                            'underworld-thug',
                            'bossk#hunt-by-instinct',
                        ],
                        spaceArena: [
                            'zygerrian-starhopper'
                        ],
                    },
                    player2: {
                        hand: ['regional-governor']
                    }
                });
            });

            describe('when the player has the Force', function () {
                it('it shows the top card of the deck and allows the player to use the force and play it for 4 less', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.zuckuss]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Use the Force and play for 4 less', 'Leave on top']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.zuckuss.title);

                    context.player1.clickDisplayCardPromptButton(context.zuckuss.uuid, 'play-discount');

                    expect(context.player1.hasTheForce).toBeFalse();
                    expect(context.player1.exhaustedResourceCount).toBe(2); // 1 for the event, 1 for Zuckuss
                    expect(context.zuckuss).toBeInZone('groundArena', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });

                it('it shows the top card of the deck and allows the player to leave it on top', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.zuckuss]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Use the Force and play for 4 less', 'Leave on top']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.zuckuss.title);

                    context.player1.clickDisplayCardPromptButton(context.zuckuss.uuid, 'leave');

                    expect(context.player1.hasTheForce).toBeTrue();
                    expect(context.zuckuss).toBeInZone('deck', context.player1);
                });

                it('it shows the top card of the deck and disallows the player from playing it if it has been named by Regional Governor', function () {
                    const { context } = contextRef;

                    context.player1.passAction();

                    context.player2.clickCard(context.regionalGovernor);
                    context.player2.chooseListOption('Zuckuss');

                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.zuckuss]);
                    expect(context.player1).toHaveExactDisabledDisplayPromptPerCardButtons(['Use the Force and play for 4 less']);
                    expect(context.player1).toHaveExactEnabledDisplayPromptPerCardButtons(['Leave on top']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.zuckuss.title);

                    context.player1.clickDisplayCardPromptButton(context.zuckuss.uuid, 'leave');

                    expect(context.player1.hasTheForce).toBeTrue();
                    expect(context.zuckuss).toBeInZone('deck', context.player1);
                });


                it('it allows the player to play a unit with Piloting as an upgrade', function () {
                    const { context } = contextRef;

                    context.moveToNextActionPhase(); // To discard Zuckuss using Aphra's ability

                    expect(context.zuckuss).toBeInZone('discard', context.player1);
                    expect(context.bossk).toBeInZone('deck', context.player1);

                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.bossk]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Use the Force and play for 4 less', 'Leave on top']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.bossk.title);

                    context.player1.clickDisplayCardPromptButton(context.bossk.uuid, 'play-discount');

                    expect(context.player1).toHaveExactPromptButtons([
                        'Play Bossk',
                        'Play Bossk with Piloting'
                    ]);
                    context.player1.clickPrompt('Play Bossk with Piloting');
                    expect(context.player1).toBeAbleToSelectExactly([context.zygerrianStarhopper]);
                    context.player1.clickCard(context.zygerrianStarhopper);

                    expect(context.player1.hasTheForce).toBeFalse();
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    expect(context.zygerrianStarhopper).toHaveExactUpgradeNames(['bossk#hunt-by-instinct']);
                });
            });

            describe('when the player does not have the Force', function () {
                it('it shows the top card of the deck', function () {
                    const { context } = contextRef;

                    context.player1.setHasTheForce(false);

                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.zuckuss]);
                    expect(context.player1).toHaveEnabledPromptButton('Done');
                    expect(context.getChatLogs(1)[0]).not.toContain(context.zuckuss.title);

                    context.player1.clickPrompt('Done');

                    expect(context.player2).toBeActivePlayer();
                    expect(context.zuckuss).toBeInZone('deck');
                });
            });

            describe('when the deck is empty', function () {
                it('it does nothing', function () {
                    const { context } = contextRef;

                    context.player1.setDeck([]);

                    expect(context.player1.deck.length).toEqual(0);
                    context.player1.clickCard(context.asIHaveForeseen);

                    expect(context.asIHaveForeseen).toBeInZone('discard', context.player1);
                    expect(context.player1.hasTheForce).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('When the player does not have enough resources', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'doctor-aphra#rapacious-archaeologist',
                        hasForceToken: true,
                        resources: 1,
                        hand: ['as-i-have-foreseen'],
                        deck: ['zuckuss#bounty-hunter-for-hire']
                    }
                });
            });

            it('itdoes not allow the player to play the card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asIHaveForeseen);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.zuckuss]);
                expect(context.player1).toHaveExactDisabledDisplayPromptPerCardButtons(['Use the Force and play for 4 less']);
                expect(context.player1).toHaveExactEnabledDisplayPromptPerCardButtons(['Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.zuckuss.title);

                context.player1.clickDisplayCardPromptButton(context.zuckuss.uuid, 'leave');

                expect(context.player1.hasTheForce).toBeTrue();
                expect(context.zuckuss).toBeInZone('deck', context.player1);
            });
        });
    });
});