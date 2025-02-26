describe('Director Krennic, Aspiring to Authority', function() {
    integration(function(contextRef) {
        describe('Krennic\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', damage: 1 }, 'battlefield-marine'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
                        leader: 'director-krennic#aspiring-to-authority'
                    },
                    player2: {
                        groundArena: [{ card: 'consular-security-force', damage: 1 }],
                    }
                });
            });

            it('should give friendly damaged units +1/+0', function () {
                const { context } = contextRef;

                expect(context.wampa.getPower()).toBe(5);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.cartelSpacer.getPower()).toBe(3);
                expect(context.cartelSpacer.getHp()).toBe(3);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.wampa.damage).toBe(4);
                expect(context.consularSecurityForce.damage).toBe(6);
            });
        });

        describe('Krennic\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', damage: 1 }, 'battlefield-marine'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
                        leader: { card: 'director-krennic#aspiring-to-authority', deployed: true, damage: 1 }
                    },
                    player2: {
                        groundArena: [{ card: 'consular-security-force', damage: 1 }],
                    }
                });
            });

            it('should give friendly damaged units +1/+0', function () {
                const { context } = contextRef;

                expect(context.directorKrennic.getPower()).toBe(3);
                expect(context.directorKrennic.getHp()).toBe(7);

                expect(context.wampa.getPower()).toBe(5);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.cartelSpacer.getPower()).toBe(3);
                expect(context.cartelSpacer.getHp()).toBe(3);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.wampa.damage).toBe(4);
                expect(context.consularSecurityForce.damage).toBe(6);
            });
        });
    });
});
