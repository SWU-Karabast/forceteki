
describe('Wedge Antilles, Leader of Red Squadron', function () {
    integration(function (contextRef) {
        describe('Wedge Antilles\'s undeployed ability', function () {
            it('should play a card with Piloting from hand for 1 less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['hopeful-volunteer', 'wampa', 'determined-recruit'],
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 3
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;
                const resourcesBefore = context.player1.readyResourceCount;
                context.player1.clickCard(context.wedgeAntilles);
                expect(context.player1).toBeAbleToSelectExactly([context.hopefulVolunteer, context.determinedRecruit]);

                // Hopeful Volunteer should be automatically played as a pilot upgrade
                context.player1.clickCard(context.hopefulVolunteer);
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors]);
                context.player1.clickCard(context.concordDawnInterceptors);

                // Hopeful Volunteer should cost 1 with Wedge's cost reduction
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 1);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames([context.hopefulVolunteer.internalName]);
                expect(context.concordDawnInterceptors.getPower()).toBe(2);
                expect(context.concordDawnInterceptors.getHp()).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only exhaust if there is no unit to play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 4
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
            });

            it('should only exhaust if the hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 4
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Wedge Antilles\'s deployed ability', function () {
            it('should be able to deploy as a ground unit and have correct stats', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Deploy Wedge Antilles as a ground unit
                context.player1.clickCard(context.wedgeAntilles);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play a card from your hand using Piloting. It costs 1 less.', 'Deploy Wedge Antilles']);
                context.player1.clickPrompt('Deploy Wedge Antilles');
                expect(context.wedgeAntilles.getPower()).toBe(3);
                expect(context.wedgeAntilles.getHp()).toBe(6);
            });

            it('should not reduce the cost of the next Pilot when attacking as a ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['hopeful-volunteer', 'wampa', 'determined-recruit'],
                        resources: 5
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                // Deploy Wedge Antilles as a Pilot
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles');

                context.player2.passAction();

                // Attack with Concord Dawn Interceptors
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.hopefulVolunteer);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should reduce the cost of the next Pilot unit you play this phase by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['hopeful-volunteer', 'wampa', 'determined-recruit'],
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 5
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                // Trigger Wedge's on Attack ability
                context.player1.clickCard(context.wedgeAntilles);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play a card from your hand using Piloting. It costs 1 less.', 'Deploy Wedge Antilles', 'Deploy Wedge Antilles as a Pilot']);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors]);
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player2.passAction();
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.hopefulVolunteer);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should reduce the cost of the next Pilot upgrade you play this phase by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['hopeful-volunteer', 'wampa', 'determined-recruit'],
                        spaceArena: ['concord-dawn-interceptors', 'cartel-turncoat'],
                        resources: 5
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                // Trigger Wedge's on Attack ability
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                context.player1.clickCard(context.concordDawnInterceptors);

                context.player2.passAction();
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.hopefulVolunteer);
                context.player1.clickPrompt('Play Hopeful Volunteer with Piloting');
                context.player1.clickCard(context.cartelTurncoat);

                expect(context.cartelTurncoat).toHaveExactUpgradeNames([context.hopefulVolunteer.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not reduce both the first pilot unit and first pilot upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['hopeful-volunteer', 'wampa', 'determined-recruit'],
                        spaceArena: ['concord-dawn-interceptors', 'cartel-turncoat'],
                        resources: 5
                    },
                    player2: {
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                // Trigger Wedge's on Attack ability
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player2.passAction();
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.hopefulVolunteer);
                context.player1.clickPrompt('Play Hopeful Volunteer with Piloting');
                context.player1.clickCard(context.cartelTurncoat);

                expect(context.cartelTurncoat).toHaveExactUpgradeNames([context.hopefulVolunteer.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.determinedRecruit);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should not reduce the cost of the next non-Pilot card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        base: 'kestro-city',
                        hand: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Trigger Wedge's on Attack ability
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player2.passAction();
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });
    });
});