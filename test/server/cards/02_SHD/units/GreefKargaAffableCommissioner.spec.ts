describe('Greef Karga, Affable Commissioner', function() {
    integration(function(contextRef) {
        describe('Greef Karga\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['greef-karga#affable-commissioner'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine']
                    }
                });
            });

            it('can draw upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.greefKarga);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.foundling],
                    unselectable: [context.pykeSentinel, context.atst, context.battlefieldMarine, context.cartelSpacer]
                });
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).not.toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.foundling);
                expect(context.foundling).toBeInZone('hand');
                expect(context.getChatLogs(2)).toContain('player1 takes Foundling');
            });
        });
    });
});
