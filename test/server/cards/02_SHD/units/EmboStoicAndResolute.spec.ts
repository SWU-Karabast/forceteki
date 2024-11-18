describe('Embo, Stoic and Resolute', function () {
    integration(function (contextRef) {
        describe('Embo\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['embo#stoic-and-resolute', { card: 'echo-base-defender', damage: 2 }],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force', 'swoop-racer', 'superlaser-technician'],
                    }
                });
            });

            it('should heal 2 damage from a unit when he kill someone and survives', function () {
                const { context } = contextRef;

                function reset(resetDamage = true) {
                    context.embo.exhausted = false;
                    if (resetDamage) {
                        context.embo.damage = 0;
                    }
                    context.player2.passAction();
                }

                // kill battlefield marine, should heal 2 from a unit
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.embo, context.echoBaseDefender, context.consularSecurityForce, context.swoopRacer, context.greenSquadronAwing, context.superlaserTechnician]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.echoBaseDefender, 2],
                ]));

                // heal echo base defender
                expect(context.echoBaseDefender.damage).toBe(0);
                expect(context.embo.damage).toBe(3);

                reset();

                // defender survives, nothing happen
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();

                reset();

                // defender is defeated but not in discard
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.superlaserTechnician);
                context.player2.clickPrompt('Put Superlaser Technician into play as a resource and ready it');
                expect(context.player1).toBeAbleToSelectExactly([context.embo, context.echoBaseDefender, context.consularSecurityForce, context.swoopRacer, context.greenSquadronAwing]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.echoBaseDefender, 2],
                ]));

                reset(false);

                // embo does not complete attack, nothing happen
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.swoopRacer);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
