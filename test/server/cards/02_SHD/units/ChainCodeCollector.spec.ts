describe('Chain Code Collector', function () {
    integration(function (contextRef) {
        describe('Chain Code Collector\'s on attack ability', function () {
            it('should give -4/-0 on unit who have bounty', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chain-code-collector'],
                    },
                    player2: {
                        groundArena: [{ card: 'gideon-hask#ruthless-loyalist', upgrades: ['top-target'] }, 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                // ambush gideon hask
                context.player1.clickCard(context.chainCodeCollector);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.gideonHask);

                // chain code collector take only 1 damage (gideon gets -4/-0)
                expect(context.chainCodeCollector.damage).toBe(1);

                expect(context.player2).toBeActivePlayer();
                context.chainCodeCollector.exhausted = false;
                context.player2.passAction();

                // attack battlefield marine, no bounty on it, nothing happens
                context.player1.clickCard(context.chainCodeCollector);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.chainCodeCollector).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
