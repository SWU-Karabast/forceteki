describe('Zeb Orrelios, Headstrong Warrior', function () {
    integration(function (contextRef) {
        describe('Zeb Orrelios\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#headstrong-warrior', 'swoop-racer'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['superlaser-technician', 'consular-security-force', 'steadfast-battalion'],
                    }
                });
            });

            it('should deal 4 damage to a ground unit when he kill someone and survives', function () {
                const { context } = contextRef;

                // kill superlaser technician, should deal 4 to a ground unit
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.superlaserTechnician);
                context.player2.clickPrompt('Put Superlaser Technician into play as a resource and ready it');
                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios, context.swoopRacer, context.consularSecurityForce, context.steadfastBattalion]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                // reset
                context.zebOrrelios.exhausted = false;
                context.setDamage(context.zebOrrelios, 0);
                context.setDamage(context.consularSecurityForce, 0);
                context.player2.passAction();

                // consular security force is not defeat, nothing happen
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();

                // reset
                context.zebOrrelios.exhausted = false;
                context.setDamage(context.zebOrrelios, 0);
                context.player2.passAction();

                // zeb kill someone but die too, nothing happen
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.steadfastBattalion);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
