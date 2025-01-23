describe('Viper Probe Droid', function() {
    integration(function(contextRef) {
        describe('Viper Probe Droid\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['viper-probe-droid']
                    },
                    player2: {
                        hand: ['wampa', 'battlefield-marine', 'pyke-sentinel'],
                        groundArena: ['scout-bike-pursuer']
                    }
                });
            });

            it('should reveal enemy hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.viperProbeDroid);
                expect(context.viperProbeDroid.zoneName).toBe('groundArena');
                expect(context.getChatLogs(1)).toContain('Viper Probe Droid sees Wampa, Battlefield Marine, and Pyke Sentinel');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be playable when enemy hand is empty', function () {
                const { context } = contextRef;

                context.player2.setHand([]);
                context.player1.clickCard(context.viperProbeDroid);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
