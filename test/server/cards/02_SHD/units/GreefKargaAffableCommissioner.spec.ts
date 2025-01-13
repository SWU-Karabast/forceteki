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
                expect(context.player1).toHaveExactDisplayPromptCards([context.foundling, context.pykeSentinel, context.atst, context.battlefieldMarine, context.cartelSpacer]);
                context.player1.clickCardInDisplayCardPrompt(context.foundling);
                expect(context.foundling).toBeInZone('hand');
                expect(context.getChatLogs(2)).toContain('player1 takes Foundling');

                // expect(context.player1).toHavePrompt('Select a card to reveal');
                // expect(context.player1).toHaveEnabledPromptButton(context.foundling.title);
                // expect(context.player1).toHaveDisabledPromptButtons([context.atst.title, context.battlefieldMarine.title, context.cartelSpacer.title, context.pykeSentinel.title]);
                // context.player1.clickPrompt(context.foundling.title);
                // expect(context.foundling).toBeInZone('hand');
                // expect(context.getChatLogs(2)).toContain('player1 takes Foundling');
            });
        });
    });
});
