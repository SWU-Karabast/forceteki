describe('Padmé Amidala, With Great Pleasure', function() {
    integration(function(contextRef) {
        describe('its constant ability', function() {
            it('gives +3/+3 to other friendly Heroism units only', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['padme-amidala#with-great-pleasure', 'wampa', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;
                const friendlyMarine = context.player1.findCardByName('battlefield-marine');
                const enemyMarine = context.player2.findCardByName('battlefield-marine');

                // Friendly Heroism unit is buffed: 3/3 → 6/6
                expect(friendlyMarine.getPower()).toBe(6);
                expect(friendlyMarine.getHp()).toBe(6);

                // Padmé herself is not buffed — keeps printed 5/7
                expect(context.padmeAmidala.getPower()).toBe(5);
                expect(context.padmeAmidala.getHp()).toBe(7);

                // Wampa has no Heroism aspect — unbuffed
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Friendly Heroism space unit is buffed: 2/3 → 5/6
                expect(context.allianceXwing.getPower()).toBe(5);
                expect(context.allianceXwing.getHp()).toBe(6);

                // Enemy Heroism unit is not buffed
                expect(enemyMarine.getPower()).toBe(3);
                expect(enemyMarine.getHp()).toBe(3);
            });
        });
    });
});
