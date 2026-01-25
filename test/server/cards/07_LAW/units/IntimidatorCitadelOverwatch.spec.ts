describe('Intimidator, Citadel Overwatch', function() {
    integration(function(contextRef) {
        describe('Intimidator\'s When Played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'shadowed-undercity',
                        hand: ['intimidator#citadel-overwatch', 'no-glory-only-results'],
                        leader: { card: 'hondo-ohnaka#thats-good-business', deployed: true },
                        resources: [
                            'kintan-intimidator',
                            'cartel-spacer',
                            'zygerrian-starhopper',
                            'ma-klounkee',
                            'bounty-hunter-crew',
                            'restock',
                            'rivals-fall',
                            'power-of-the-dark-side',
                            'open-fire',
                            'relentless-pursuit',
                            'stolen-athauler',
                            'stolen-landspeeder',
                            'stolen-starpath-unit',
                            'craving-power',
                            'overwhelming-barrage',
                        ]
                    },
                    player2: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['superlaser-technician'],
                    }
                });
            });

            it('returns any number of resources to hand, including opponent owned cards', function () {
                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(15);
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickPrompt('Trigger');
                expect(context.player1.readyResourceCount).toBe(11);

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.intimidatorCitadelOverwatch);

                expect(context.player1).toBeAbleToSelectExactly(context.player1.resources);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickCard(context.openFire);
                expect(context.player1).toHaveEnabledPromptButtons(['Done']);
                context.player1.clickDone();

                expect(context.openFire).toBeInZone('hand', context.player1);
                expect(context.superlaserTechnician).toBeInZone('hand', context.player2);
                expect(context.player1.exhaustedResourceCount).toBe(14);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.player1.credits).toBe(2);
            });

            it('should function if nothing is chosen', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.intimidatorCitadelOverwatch);

                context.player1.clickPrompt('Choose Nothing');

                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(11);
                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});