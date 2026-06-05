describe('Domesticated Loth-Cat', function() {
    integration(function(contextRef) {
        describe('while in play', function() {
            it('should prevent enemy units from triggering Ambush when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['domesticated-lothcat']
                    },
                    player2: {
                        hand: ['escort-skiff'],
                        spaceArena: ['patrolling-vwing'],
                        groundArena: ['wampa'],
                        resources: 10,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.escortSkiff);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.damage).toBe(0);
            });

            it('should allow friendly units to trigger Ambush when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['escort-skiff'],
                        groundArena: ['domesticated-lothcat'],
                        spaceArena: ['patrolling-vwing'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.escortSkiff);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(4);
            });

            it('should prevent enemy units from triggering Support when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['domesticated-lothcat']
                    },
                    player2: {
                        hand: ['doctor-pershing#dedicated-to-research'],
                        groundArena: ['battlefield-marine'],
                        resources: 10,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.doctorPershing);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p1Base.damage).toBe(0);
            });

            it('should allow friendly units to trigger Support when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doctor-pershing#dedicated-to-research'],
                        groundArena: ['domesticated-lothcat', 'battlefield-marine'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorPershing);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should make enemy units already in play lose Ambush and Support', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown'],
                        groundArena: ['domesticated-lothcat'],
                        resources: 10
                    },
                    player2: {
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        groundArena: ['escort-skiff', 'doctor-pershing#dedicated-to-research'],
                        spaceArena: ['patrolling-vwing']
                    }
                });

                const { context } = contextRef;
                const escortSkiffBasePower = context.escortSkiff.getPower();
                const doctorPershingBasePower = context.doctorPershing.getPower();

                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.domesticatedLothcat);

                expect(context.escortSkiff.getPower()).toBe(escortSkiffBasePower + 1);
                expect(context.doctorPershing.getPower()).toBe(doctorPershingBasePower + 1);
            });
        });
    });
});
