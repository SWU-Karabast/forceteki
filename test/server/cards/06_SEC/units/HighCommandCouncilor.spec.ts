describe('High Command Councilor', function () {
    integration(function (contextRef) {
        describe('High Command Councilor\'s constant ability (Raid 2)', function () {
            it('should gain Raid 2 while you control another Official unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wartime-trade-official'],
                        groundArena: ['high-command-councilor']
                    }
                });

                const { context } = contextRef;

                // Without another Official in play, attacks for base power (1)
                context.player1.clickCard(context.highCommandCouncilor);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);

                // Next action phase: play an Official and verify Raid 2 applies
                context.moveToNextActionPhase();

                context.setDamage(context.p2Base, 0);
                context.player1.clickCard(context.wartimeTradeOfficial);

                context.player2.passAction();
                context.player1.clickCard(context.highCommandCouncilor);
                context.player1.clickCard(context.p2Base);
                // Power 1 + Raid 2 = 3 total damage
                expect(context.p2Base.damage).toBe(3); // 1 (first attack) + 3 (second attack)
            });
        });
    });
});
