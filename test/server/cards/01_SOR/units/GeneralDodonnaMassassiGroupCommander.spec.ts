describe('General Dodonna, Massassi Group Commander', function() {
    integration(function(contextRef) {
        describe('General Dodonna\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(4);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.generalDodonna.getPower()).toBe(4);
                expect(context.generalDodonna.getHp()).toBe(4);

                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);

                expect(context.leiaOrgana.getPower()).toBe(4);
                expect(context.leiaOrgana.getHp()).toBe(7);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);

                expect(context.specforceSoldier.getPower()).toBe(2);
                expect(context.specforceSoldier.getHp()).toBe(2);

                // test stats are effective for an attack
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.battlefieldMarine.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(4);
            });
        });
    });
});
