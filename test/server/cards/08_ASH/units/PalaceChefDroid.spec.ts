describe('Palace Chef Droid', function() {
    integration(function(contextRef) {
        describe('Palace Chef Droid\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['palace-chef-droid']
                    },
                    player2: {
                        groundArena: ['gungi#finding-himself']
                    },
                });
            });

            it('should has +2/+0 while defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.palaceChefDroid);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(0);

                context.player2.clickCard(context.gungi);
                context.player2.clickCard(context.palaceChefDroid);

                expect(context.palaceChefDroid.damage).toBe(2);
                expect(context.palaceChefDroid.getPower()).toBe(0);
                expect(context.gungi.damage).toBe(2);
            });
        });
    });
});
