describe('Darth Sidious, Under a Cloak of Darkness', function() {
    integration(function(contextRef) {
        describe('Darth Sidious\' constant and triggered abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#under-a-cloak-of-darkness', 'clone-trooper', 'super-battle-droid'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper', 'warrior-drone', 'atst'],
                    }
                });
            });

            it('should not create a Battle Droid token when a token is defeated', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickCard(context.atst);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(0);
            });

            it('should create a Battle Droid token when a non-token is defeated', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickCard(context.warriorDrone);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
            });

            it('should work off of Sidious dying', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.atst);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
            });

            it('should be giving other friendly Separatists +1/+0', function() {
                const { context } = contextRef;

                expect(context.darthSidious.getPower()).toBe(4);
                expect(context.superBattleDroid.getPower()).toBe(5);
                expect(context.awing.getPower()).toBe(1);
                expect(context.cloneTrooper.getPower()).toBe(2);
                expect(context.warriorDrone.getPower()).toBe(1);
                expect(context.atst.getPower()).toBe(6);
                expect(context.deathStarStormtrooper.getPower()).toBe(3);
            });
        });
    });
});