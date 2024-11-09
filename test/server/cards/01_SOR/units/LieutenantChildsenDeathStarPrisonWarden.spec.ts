describe('Lieutenant Childsen', function() {
    integration(function(contextRef) {
        describe('Lieutenant Childsen\'s When Played ability', function() {
            describe('when hand contains some Vigilance cards', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: [
                                'lieutenant-childsen#death-star-prison-warden',
                                'pyke-sentinel',
                                'system-patrol-craft',
                                'cargo-juggernaut',
                                'resilient',
                                'vanquish',
                                'confiscate',
                                'underworld-thug',
                            ],
                            groundArena: ['atst'],
                            spaceArena: ['cartel-spacer'],
                        },
                        player2: {
                            hand: ['rivals-fall'],
                            groundArena: ['wampa'],
                            spaceArena: ['alliance-xwing']
                        }
                    });
                });

                it('should gain experience based on the number of revelead cards', function () {
                    const { context } = contextRef;

                    const reset = () => {
                        context.player2.resources.forEach((card) => card.exhausted = false);
                        context.player2.moveCard(context.rivalsFall, 'hand');
                        context.player2.clickCard(context.rivalsFall);
                        context.player2.clickCard(context.lieutenantChildsen);
                        context.player1.moveCard(context.lieutenantChildsen, 'hand');
                        context.player1.resources.forEach((card) => card.exhausted = false);
                    };

                    // Reveal 1 Vigilance card
                    context.player1.clickCard(context.lieutenantChildsen);
                    expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.systemPatrolCraft, context.cargoJuggernaut, context.resilient, context.vanquish]);
                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickPrompt('Done');

                    expect(context.getChatLogs(2)).toEqual([
                        'player1 uses Lieutenant Childsen to reveal a card',
                        'player1 reveals Pyke Sentinel due to Lieutenant Childsen',
                    ]);

                    expect(context.lieutenantChildsen).toHaveExactUpgradeNames(['experience']);
                    expect(context.player2).toBeActivePlayer();

                    reset();

                    // Reveal 4 Vigilance cards
                    context.player1.clickCard(context.lieutenantChildsen);
                    expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.systemPatrolCraft, context.cargoJuggernaut, context.resilient, context.vanquish]);
                    context.player1.clickCard(context.cargoJuggernaut);
                    context.player1.clickCard(context.vanquish);
                    context.player1.clickCard(context.resilient);
                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickCardNonChecking(context.systemPatrolCraft);
                    context.player1.clickPrompt('Done');

                    expect(context.getChatLogs(2)).toEqual([
                        'player1 uses Lieutenant Childsen to reveal 4 cards',
                        'player1 reveals Cargo Juggernaut, Vanquish, Resilient, Pyke Sentinel due to Lieutenant Childsen',
                    ]);

                    expect(context.lieutenantChildsen).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);
                    expect(context.player2).toBeActivePlayer();

                    reset();

                    // Reveal no Vigilance cards
                    context.player1.clickCard(context.lieutenantChildsen);
                    expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.systemPatrolCraft, context.cargoJuggernaut, context.resilient, context.vanquish]);
                    context.player1.clickPrompt('Done');

                    expect(context.lieutenantChildsen).toHaveExactUpgradeNames([]);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when hand does not contain any Vigilance card', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: [
                                'lieutenant-childsen#death-star-prison-warden',
                                'confiscate',
                                'underworld-thug',
                            ],
                            groundArena: ['atst'],
                            spaceArena: ['cartel-spacer']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            spaceArena: ['alliance-xwing']
                        }
                    });
                });

                it('gains no experience', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.lieutenantChildsen);

                    expect(context.lieutenantChildsen).toHaveExactUpgradeNames([]);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});