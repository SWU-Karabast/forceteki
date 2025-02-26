describe('Asajj Ventress Count Doooku\'s Assassin', function() {
    integration(function(contextRef) {
        it('Asajj Ventress Count Doooku\'s Assassin\'s ability on attack should get +3/0 if a separatist unit has attacked this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-fighting'],
                    groundArena: ['asajj-ventress#count-dookus-assassin', 'relentless-rocket-droid', 'shaak-ti#unity-wins-wars']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['consular-security-force', 'separatist-commando']
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

            // But if a new copy of Asajj Ventress is played, she should get +3/+0
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.asajjVentress);
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Play Asajj Ventress');
            context.player2.passAction();
            context.player1.clickCard(context.keepFighting);
            context.player1.clickCard(context.asajjVentress);
            context.player2.passAction();
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(15);

            // Shaak Ti is not sepratist so Asajj Ventress should not get +3/+0
            // Even if an opponent separatist unit has attacked it should not get +3/+0
            context.moveToNextActionPhase();
            context.player1.clickCard(context.shaakTi);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(18);

            context.player2.clickCard(context.separatistCommando);
            context.player2.clickCard(context.p1Base);
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.p2Base);
            expect(context.asajjVentress.getPower()).toBe(2);
            expect(context.p2Base.damage).toBe(20);
        });
    });
});
