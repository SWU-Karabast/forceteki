describe('Bombing Run', function() {
    integration(function(contextRef) {
        describe('Bombing Run\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bombing-run'],
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
                it('should deal 3 damage to each ground unit', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.bombingRun);
                    expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                    context.player1.clickPrompt('Ground');

                    expect(context.atst.damage).toBe(3);
                    expect(context.cartelSpacer.damage).toBe(0);
                    expect(context.wampa.damage).toBe(3);
                    expect(context.allianceXwing.damage).toBe(0);
                    expect(context.bobaFett.damage).toBe(3);
                    expect(context.lukeSkywalker.damage).toBe(3);
                });
            });

            describe('when space arena is chosen', function() {
                it('should deal 3 damage to each space unit', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.bombingRun);
                    expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                    context.player1.clickPrompt('Space');

                    expect(context.atst.damage).toBe(0);
                    expect(context.cartelSpacer).toBeInLocation('discard');
                    expect(context.wampa.damage).toBe(0);
                    expect(context.allianceXwing).toBeInLocation('discard');
                    expect(context.bobaFett.damage).toBe(0);
                    expect(context.lukeSkywalker.damage).toBe(0);
                });
            });
        });
    });
});
