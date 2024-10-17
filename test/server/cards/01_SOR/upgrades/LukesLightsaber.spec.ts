describe('Luke\'s Lightsaber', function() {
    integration(function(contextRef) {
        describe('Luke\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lukes-lightsaber'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', damage: 5, upgrades: ['shield'] }, { card: 'battlefield-marine', damage: 2 }, 'reinforcement-walker'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should heal all damage from and give a shield to its holder when played, only if that unit is Luke Skywalker', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukesLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalkerJediKnight, context.lukeSkywalkerFaithfulFriend, context.battlefieldMarine]);

                context.player1.clickCard(context.lukeSkywalkerJediKnight);

                expect(context.lukeSkywalkerJediKnight.damage).toBe(0);
                expect(context.lukeSkywalkerJediKnight).toHaveExactUpgradeNames(['lukes-lightsaber', 'shield', 'shield']);
            });

            it('should give a shield to Luke when played on him even if it doesn\'t heal any damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukesLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalkerJediKnight, context.lukeSkywalkerFaithfulFriend, context.battlefieldMarine]);

                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);

                expect(context.lukeSkywalkerFaithfulFriend).toHaveExactUpgradeNames(['lukes-lightsaber', 'shield']);
            });

            it('should have no effect on any unit other than Luke Skywalker', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukesLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalkerJediKnight, context.lukeSkywalkerFaithfulFriend, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['lukes-lightsaber']);
            });
        });
    });
});
