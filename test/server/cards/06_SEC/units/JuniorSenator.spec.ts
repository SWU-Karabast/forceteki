describe('Junior Senator', function () {
    integration(function (contextRef) {
        describe('Junior Senator\'s ability', function() {
            it('should return an upgrade that costs 3 or less to its owner\'s hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['lukes-lightsaber', 'jedi-lightsaber'] }],
                        discard: ['entrenched']
                    },
                    player2: {
                        hand: ['junior-senator'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['chewbacca#faithful-first-mate'] }],
                        discard: ['hotshot-dl44-blaster']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.isUpgraded()).toBe(true);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.juniorSenator);
                expect(context.player2).toBeAbleToSelectExactly([context.jediLightsaber, context.lukesLightsaber]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.jediLightsaber);
                expect(context.player1.hand.length).toBe(1);
                expect(context.jediLightsaber).toBeInZone('hand', context.player1);
            });

            it('should defeat a token upgrade instead of returning to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['junior-senator'],
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

                context.player1.clickCard(context.juniorSenator);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.lukesLightsaber, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
                expect(context.lukeSkywalkerJediKnight.upgrades.length).toBe(1);
                expect(context.experience).toBeInZone('outsideTheGame', context.player2);
            });
        });
    });
});