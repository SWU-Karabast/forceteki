
describe('Resistance X-Wing', function() {
    integration(function(contextRef) {
        describe('Resistance X-Wing', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interceptor-ace', 'moment-of-peace'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['resistance-xwing']
                    },
                    player2: {
                        hand: ['confiscate'],
                        spaceArena: ['restored-arc170']
                    }
                });
            });

            it('should gain +1/+1 when a pilot is attached', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace with Piloting');
                context.player1.clickCard(context.resistanceXwing);

                expect(context.resistanceXwing.getPower()).toBe(5); // 2 Base power + 2 from Pilot + 1 from Resistance X-Wing ability
                expect(context.resistanceXwing.getHp()).toBe(6); // 2 Base HP + 3 from Pilot + 1 from Resistance X-Wing ability
            });

            it('should not gain +1/+1 if upgrade is not a Pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.momentOfPeace);
                context.player1.clickCard(context.resistanceXwing);
                expect(context.resistanceXwing.getPower()).toBe(2);
                expect(context.resistanceXwing.getHp()).toBe(2);
            });
        });
    });
});