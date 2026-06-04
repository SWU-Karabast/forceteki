describe('Domesticated Loth-Cat', function() {
    integration(function(contextRef) {
        it('should make enemy units lose Ambush and Support while friendly units keep them, then restore the enemy keywords after it leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['domesticated-lothcat', 'escort-skiff', 'doctor-pershing#dedicated-to-research'],
                    spaceArena: ['patrolling-vwing']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['escort-skiff', 'doctor-pershing#dedicated-to-research'],
                    spaceArena: ['patrolling-vwing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;
            const friendlyEscortSkiff = context.player1.findCardByName('escort-skiff');
            const friendlyDoctorPershing = context.player1.findCardByName('doctor-pershing#dedicated-to-research');
            const enemyEscortSkiff = context.player2.findCardByName('escort-skiff');
            const enemyDoctorPershing = context.player2.findCardByName('doctor-pershing#dedicated-to-research');

            expect(friendlyEscortSkiff.hasSomeKeyword('ambush')).toBeTrue();
            expect(friendlyDoctorPershing.hasSomeKeyword('support')).toBeTrue();

            expect(enemyEscortSkiff.hasSomeKeyword('ambush')).toBeFalse();
            expect(enemyDoctorPershing.hasSomeKeyword('support')).toBeFalse();

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.domesticatedLothcat);

            expect(enemyEscortSkiff.hasSomeKeyword('ambush')).toBeTrue();
            expect(enemyDoctorPershing.hasSomeKeyword('support')).toBeTrue();
        });
    });
});
