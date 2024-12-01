describe('Criminal Muscle', function () {
    integration(function (contextRef) {
        describe('Criminal Muscle\'s ability', function() {
            it('should return an non-unique upgrade to owner\'s hand', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['frozen-in-carbonite'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['lukes-lightsaber', 'jedi-lightsaber'] }],
                        discard: ['entrenched']
                    },
                    player2: {
                        hand: ['criminal-muscle'],
                        groundArena: ['pyke-sentinel'],
                        discard: ['hotshot-dl44-blaster']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frozenInCarbonite);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.isUpgraded()).toBe(true);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.criminalMuscle);
                expect(context.player2).toBeAbleToSelectExactly([context.frozenInCarbonite, context.jediLightsaber]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.frozenInCarbonite);
                expect(context.pykeSentinel.isUpgraded()).toBe(false);
                expect(context.player1.hand.length).toBe(1);
                expect(context.frozenInCarbonite).toBeInZone('hand', context.player1);
            });

            it('should return an token upgrade to out of play arena', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['criminal-muscle'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['entrenched'] }],
                        discard: ['hotshot-dl44-blaster']
                    },
                    player2: {
                        hand: ['frozen-in-carbonite'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['lukes-lightsaber', 'experience'] }],
                        discard: ['jedi-lightsaber']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.criminalMuscle);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
                expect(context.lukeSkywalkerJediKnight.upgrades.length).toBe(1);
                expect(context.experience).toBeInZone('out-of-play', context.player2);
            });
        });
    });
});