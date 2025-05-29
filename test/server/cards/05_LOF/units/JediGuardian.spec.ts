describe('Jedi Guardian', function() {
    integration(function(contextRef) {
        describe('Jedi Guardian\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedi-guardian']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    },
                });
            });

            it('should has +2/+0 while defending', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.jediGuardian);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.jediGuardian);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.jediGuardian.getPower()).toBe(4);
                expect(context.jediGuardian.damage).toBe(3);
            });
        });
    });
});
