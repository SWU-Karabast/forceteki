describe('Kylo Ren\'s Command Shuttle, Icon Of Authority', function() {
    integration(function(contextRef) {
        describe('Kylo Ren\'s Command Shuttle\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['pyke-sentinel', 'hylobon-enforcer'],
                        spaceArena: ['kylo-rens-command-shuttle#icon-of-authority', 'black-sun-starfighter'],
                        leader: { card: 'kylo-ren#were-not-done-yet', deployed: true },
                    },
                    player2: {
                        groundArena: ['echo-base-defender'],
                        spaceArena: ['bright-hope#the-last-transport'],
                    }
                });
            });

            it('should give friendly ground units with Sentinel +0/+2', function () {
                const { context } = contextRef;

                expect(context.pykeSentinel.getPower()).toBe(2);
                expect(context.pykeSentinel.getHp()).toBe(5);
                expect(context.hylobonEnforcer.getPower()).toBe(1);
                expect(context.hylobonEnforcer.getHp()).toBe(4);
                expect(context.kyloRenWereNotDoneYet.getPower()).toBe(5);
                expect(context.kyloRenWereNotDoneYet.getHp()).toBe(7);
                expect(context.blackSunStarfighter.getPower()).toBe(3);
                expect(context.blackSunStarfighter.getHp()).toBe(2);
                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(3);
                expect(context.brightHopeTheLastTransport.getPower()).toBe(2);
                expect(context.brightHopeTheLastTransport.getHp()).toBe(6);
            });
        });
    });
});