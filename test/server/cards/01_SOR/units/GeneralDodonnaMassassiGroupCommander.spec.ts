describe('General Dodonna, Massassi Group Commander', function() {
    integration(function() {
        describe('General Dodonna\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'general-dodonna#massassi-group-commander', 'wampa'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'specforce-soldier'],
                    }
                });
            });

            it('should give +1/+1 to all other friendly Rebel units', function () {
                expect(this.battlefieldMarine.getPower()).toBe(4);
                expect(this.battlefieldMarine.getHp()).toBe(4);

                expect(this.wampa.getPower()).toBe(4);
                expect(this.wampa.getHp()).toBe(5);

                expect(this.generalDodonna.getPower()).toBe(4);
                expect(this.generalDodonna.getHp()).toBe(4);

                expect(this.allianceXwing.getPower()).toBe(3);
                expect(this.allianceXwing.getHp()).toBe(4);

                expect(this.leiaOrgana.getPower()).toBe(4);
                expect(this.leiaOrgana.getHp()).toBe(7);

                expect(this.consularSecurityForce.getPower()).toBe(3);
                expect(this.consularSecurityForce.getHp()).toBe(7);

                expect(this.specforceSoldier.getPower()).toBe(2);
                expect(this.specforceSoldier.getHp()).toBe(2);

                // test stats are effective for an attack
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.battlefieldMarine.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(4);
            });
        });
    });
});
