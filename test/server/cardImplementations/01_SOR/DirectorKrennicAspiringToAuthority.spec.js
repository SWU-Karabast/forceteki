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

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('should give friendly damaged units +1/+0', function () {
                expect(this.wampa.power).toBe(5);
                expect(this.wampa.hp).toBe(5);

                expect(this.battlefieldMarine.power).toBe(3);
                expect(this.battlefieldMarine.hp).toBe(3);

                expect(this.cartelSpacer.power).toBe(3);
                expect(this.cartelSpacer.hp).toBe(3);

                expect(this.consularSecurityForce.power).toBe(3);
                expect(this.consularSecurityForce.hp).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.consularSecurityForce);

                expect(this.wampa.damage).toBe(4);
                expect(this.consularSecurityForce.damage).toBe(6);
            });

            it('should deploy and the persistent effect should work', function () {
                this.player1.clickCard(this.directorKrennic);
                expect(this.directorKrennic).toBeInLocation('ground arena');
                expect(this.directorKrennic).not.toBeInLocation('base');

                expect(this.wampa.power).toBe(5);
                expect(this.wampa.hp).toBe(5);

                expect(this.battlefieldMarine.power).toBe(3);
                expect(this.battlefieldMarine.hp).toBe(3);

                expect(this.cartelSpacer.power).toBe(3);
                expect(this.cartelSpacer.hp).toBe(3);

                expect(this.consularSecurityForce.power).toBe(3);
                expect(this.consularSecurityForce.hp).toBe(7);

                // do an attack to ensure the ability is being applied correctly in combat
                this.player2.passAction();
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.consularSecurityForce);

                expect(this.wampa.damage).toBe(4);
                expect(this.consularSecurityForce.damage).toBe(6);
            });

            it('should deploy and have restore 2', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.directorKrennic);
                expect(this.directorKrennic).toBeInLocation('ground arena');
                expect(this.directorKrennic).not.toBeInLocation('base');

                // do an attack to ensure the ability is being applied correctly in combat
                this.player2.passAction();
                this.player1.clickCard(this.directorKrennic);
                this.player1.clickCard(this.player2.base);

                expect(this.p1Base.damage).toBe(3);
                expect(this.p2Base.damage).toBe(2);
            });
        });
    });
});
