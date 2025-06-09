describe('Tusken Tracker', function() {
    integration(function(contextRef) {
        describe('Tusken Tracker\'s when played ability', function() {
            it('should remove Hidden from all enemy units for the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tusken-tracker'],
                        groundArena: ['village-tender', 'witch-of-the-mist'],
                    },
                    player2: {
                        groundArena: ['vulptex'],
                        hand: ['banking-clan-shuttle', 'charging-phillak'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickPrompt('pass');
                context.player2.clickCard(context.bankingClanShuttle);


                expect(context.villageTender.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.witchOfTheMist.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.bankingClanShuttle.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.vulptex.hasSomeKeyword('hidden')).toBeTrue();

                context.player1.clickCard(context.tuskenTracker);

                expect(context.villageTender.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.witchOfTheMist.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.bankingClanShuttle.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.vulptex.hasSomeKeyword('hidden')).toBeFalse();

                context.player2.clickCard(context.chargingPhillak);
                context.player2.clickPrompt('pass');
                expect(context.chargingPhillak.hasSomeKeyword('hidden')).toBeTrue();

                context.moveToRegroupPhase();

                expect(context.villageTender.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.witchOfTheMist.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.bankingClanShuttle.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.vulptex.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.chargingPhillak.hasSomeKeyword('hidden')).toBeTrue();
            });
        });
    });
});