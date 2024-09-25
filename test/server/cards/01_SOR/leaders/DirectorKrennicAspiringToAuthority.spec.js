describe('Director Krennic, Aspiring to Authority', function() {
    integration(function() {
        describe('Krennic\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                expect(this.wampa.getPower()).toBe(5);
                expect(this.wampa.getHp()).toBe(5);

                expect(this.battlefieldMarine.getPower()).toBe(3);
                expect(this.battlefieldMarine.getHp()).toBe(3);

                expect(this.cartelSpacer.getPower()).toBe(3);
                expect(this.cartelSpacer.getHp()).toBe(3);

                expect(this.consularSecurityForce.getPower()).toBe(3);
                expect(this.consularSecurityForce.getHp()).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.consularSecurityForce);

                expect(this.wampa.damage).toBe(4);
                expect(this.consularSecurityForce.damage).toBe(6);
            });
        });

        describe('Krennic\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                expect(this.directorKrennic.getPower()).toBe(3);
                expect(this.directorKrennic.getHp()).toBe(7);

                expect(this.wampa.getPower()).toBe(5);
                expect(this.wampa.getHp()).toBe(5);

                expect(this.battlefieldMarine.getPower()).toBe(3);
                expect(this.battlefieldMarine.getHp()).toBe(3);

                expect(this.cartelSpacer.getPower()).toBe(3);
                expect(this.cartelSpacer.getHp()).toBe(3);

                expect(this.consularSecurityForce.getPower()).toBe(3);
                expect(this.consularSecurityForce.getHp()).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.consularSecurityForce);

                expect(this.wampa.damage).toBe(4);
                expect(this.consularSecurityForce.damage).toBe(6);
            });
        });
    });
});
