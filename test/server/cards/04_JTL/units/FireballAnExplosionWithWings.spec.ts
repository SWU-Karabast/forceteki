describe('Fireball, An Explosion With Wings', function() {
    integration(function(contextRef) {
        describe('Fireball\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fireball#an-explosion-with-wings']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('includes Ambush', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.fireball);

                expect(context.player1).toHavePrompt('Trigger the ability \'Ambush\' or pass');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.fireball.damage).toBe(2);
            });

            it('deals 1 damage to itself at the start of the regroup phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Pass');

                expect(context.fireball.damage).toBe(0);

                context.player2.claimInitiative();
                context.player1.passAction();

                expect(context.fireball.damage).toBe(1);
            });
        });
    });
});