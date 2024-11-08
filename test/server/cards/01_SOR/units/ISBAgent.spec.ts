describe('ISB Agent', function() {
    integration(function(contextRef) {
        describe('ISB Agent\'s When Played ability', function() {
            describe('when hand contains some events', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['confiscate', 'waylay', 'isb-agent'],
                            groundArena: ['atst'],
                            spaceArena: ['cartel-spacer']
                        },
                        player2: {
                            hand: ['disarm'],
                            groundArena: ['wampa'],
                            spaceArena: ['alliance-xwing']
                        }
                    });
                });

                it('should deal 1 damage to a unit when an event is revealed', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.isbAgent);

                    expect(context.player1).toBeAbleToSelectExactly([context.confiscate, context.waylay]);
                    expect(context.player1).toHaveChooseNoTargetButton();
                    expect(context.player1).not.toHavePassAbilityButton();
                    context.player1.clickCard(context.confiscate);

                    expect(context.getChatLogs(3)).toEqual([
                        'player1 plays ISB Agent',
                        'player1 uses ISB Agent to reveal a card',
                        'player1 reveals Confiscate due to ISB Agent',
                    ]);

                    expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.atst, context.cartelSpacer, context.wampa, context.allianceXwing]);
                    context.player1.clickCard(context.wampa);

                    expect(context.isbAgent).toBeInLocation('ground arena');
                    expect(context.wampa.damage).toBe(1);
                });

                it('should do nothing when an event is not revealed', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.isbAgent);

                    expect(context.player1).toBeAbleToSelectExactly([context.confiscate, context.waylay]);
                    expect(context.player1).toHaveChooseNoTargetButton();
                    expect(context.player1).not.toHavePassAbilityButton();
                    context.player1.clickPrompt('Choose no target');

                    expect(context.getChatLogs(2)).toEqual([
                        'player1 plays ISB Agent',
                        'player1 uses ISB Agent',
                    ]);

                    expect(context.isbAgent).toBeInLocation('ground arena');
                    expect(context.isbAgent.damage).toBe(0);
                    expect(context.atst.damage).toBe(0);
                    expect(context.cartelSpacer.damage).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                    expect(context.allianceXwing.damage).toBe(0);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when hand contains no events', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['isb-agent']
                        },
                        player2: {
                            hand: ['disarm']
                        }
                    });
                });

                it('should do nothing', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.isbAgent);

                    expect(context.getChatLogs(1)).toEqual([
                        'player1 plays ISB Agent',
                    ]);

                    expect(context.isbAgent).toBeInLocation('ground arena');
                    expect(context.isbAgent.damage).toBe(0);

                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
