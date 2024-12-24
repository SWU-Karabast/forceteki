describe('Asajj Ventress Count Doooku\'s Assassin', function() {
    integration(function(contextRef) {
        it('Asajj Ventress Count Doooku\'s Assassin\'s ability on attack should get +3/0 if a separatist unit has attacked this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['asajj-ventress#count-dookus-assassin', 'relentless-rocket-droid', 'shaak-ti#unity-wins-wars']
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            // Attack with a Separatist unit
            context.player1.clickCard(context.relentlessRocketDroid);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);
            context.player2.passAction();

            // When Attack Asajj Ventress gets +3/+0 for the phase
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(8);

            // Consular attack back on Asajj Ventress
            context.player2.clickCard(context.consularSecurityForce);
            context.player2.clickCard(context.asajjVentress);
            expect(context.consularSecurityForce.damage).toBe(5);
            expect(context.asajjVentress.damage).toBe(3);

            // Asajj Ventress should not get +3/+0 when the next-phase starts
            context.nextPhase();
            expect(context.asajjVentress.getPower()).toBe(2);
            expect(context.asajjVentress.remainingHp).toBe(1);

            // Even if Asaaj Ventress is Separatist, she should not get +3/+0 when she attacks
            context.nextPhase();
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(10);

            // Shaak Ti is not sepratist so Asajj Ventress should not get +3/+0
            context.moveToNextActionPhase();
            context.player1.clickCard(context.shaakTi);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(13);

            context.player2.passAction();
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.p2Base);
            expect(context.asajjVentress.getPower()).toBe(2);
            expect(context.p2Base.damage).toBe(15);
        });
    });
});
