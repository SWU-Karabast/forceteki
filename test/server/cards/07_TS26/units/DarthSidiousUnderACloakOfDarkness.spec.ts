describe('Darth Sidious, Under a Cloak of Darkness', function() {
    integration(function(contextRef) {
        describe('Darth Sidious\' constant and triggered abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#under-a-cloak-of-darkness', 'battle-droid'],
                        spaceArena: ['awing'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper', 'warrior-drone'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
            });

            it('should give friendly Separatist units +1/+0 and create a Battle Droid token when a non token is defeated', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.warriorDrone);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(0);
                expect(context.warriorDrone.damage).toBe(2);
                expect(context.warriorDrone.getPower()).toBe(1);

                context.player2.clickCard(context.deathStarStormtrooper);
                context.player2.clickCard(context.darthSidious);
                expect(context.player1.findCardsByName('battle-droid').length).toBe(1);
            });
        });
    });
});