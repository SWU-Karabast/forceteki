describe('Supreme Leader Snoke, Shadow Ruler', function() {
    integration(function(contextRef) {
        describe('Snoke\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['death-star-stormtrooper'],
                        groundArena: ['wampa', 'specforce-soldier'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true }
                    }
                });
            });

            it('should give -2/-2 to all enemy non-leader units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.supremeLeaderSnoke);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);

                expect(context.cartelSpacer.getPower()).toBe(0);
                expect(context.cartelSpacer.getHp()).toBe(1);

                expect(context.specforceSoldier).toBeInLocation('discard');

                expect(context.jynErso.getPower()).toBe(4);
                expect(context.jynErso.getHp()).toBe(7);

                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInLocation('discard');
            });
        });
    });
});
