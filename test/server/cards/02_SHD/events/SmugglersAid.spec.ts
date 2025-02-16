describe('Smuggler\'s Aid', function() {
    integration(function(contextRef) {
        describe('Smuggler\'s Aid\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid']
                    }
                });
            });

            it('heals base from hand', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);

                context.player1.clickCard(context.smugglersAid);
                expect(context.p1Base.damage).toBe(2);
            });
        });

        describe('Smuggler\'s Aid\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [],
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('heals base from Smuggle', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);

                context.player1.clickCard(context.smugglersAid);
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
