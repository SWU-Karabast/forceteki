describe('Outmaneuver', function() {
    integration(function(contextRef) {
        describe('Outmaneuver\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['outmaneuver'],
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            describe('when ground arena is chosen', function() {
                it('should exhaust each ground unit', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.outmaneuver);
                    expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                    context.player1.clickPrompt('Ground');

                    expect(context.atst.exhausted).toBeTrue();
                    expect(context.cartelSpacer.exhausted).toBeFalse();
                    expect(context.wampa.exhausted).toBeTrue();
                    expect(context.allianceXwing.exhausted).toBeFalse();
                    expect(context.bobaFett.exhausted).toBeTrue();
                    expect(context.lukeSkywalker.exhausted).toBeTrue();
                });
            });

            describe('when space arena is chosen', function() {
                it('should exhaust each space unit', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.outmaneuver);
                    expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                    context.player1.clickPrompt('Space');

                    expect(context.atst.exhausted).toBeFalse();
                    expect(context.cartelSpacer.exhausted).toBeTrue();
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.allianceXwing.exhausted).toBeTrue();
                    expect(context.bobaFett.exhausted).toBeFalse();
                    expect(context.lukeSkywalker.exhausted).toBeFalse();

                    // Check that we can play the card again and target the space arena, which is empty now
                    context.player1.moveCard(context.outmaneuver, 'hand');
                    context.player1.moveCard(context.cartelSpacer, 'discard');
                    context.player2.moveCard(context.allianceXwing, 'discard');
                    context.player2.passAction();

                    context.player1.clickCard(context.outmaneuver);
                    expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                    context.player1.clickPrompt('Space');

                    expect(context.atst.exhausted).toBeFalse();
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.bobaFett.exhausted).toBeFalse();
                    expect(context.lukeSkywalker.exhausted).toBeFalse();
                });
            });
        });
    });
});
