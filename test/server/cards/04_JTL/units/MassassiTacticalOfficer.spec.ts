describe('Massassi Tactical Officer', function() {
    integration(function(contextRef) {
        it('Massassi Tactical Officer\'s ability should exhaust and then attack with a Fighter unit. It get +2/+0 for this attack', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['massassi-tactical-officer', 'battlefield-marine'],
                    spaceArena: ['wing-leader', 'star-wing-scout']
                },
            });

            const { context } = contextRef;
            // Exhaust Massassi Tactical Officer, attack with fighter- Wing Leader, observe buff on attack only
            context.player1.clickCard(context.massassiTacticalOfficer);
            context.player1.clickPrompt('Attack with a Fighter unit. It get +2/+0 for this attack');

            expect(context.player1).toBeAbleToSelectExactly([context.wingLeader, context.starWingScout]);
            context.player1.clickCard(context.wingLeader);
            context.player1.clickCard(context.p2Base);

            expect(context.massassiTacticalOfficer.exhausted).toBeTrue();
            expect(context.p2Base.damage).toBe(4);
            expect(context.wingLeader.getPower()).toBe(2);

            context.moveToNextActionPhase();

            // Check that when exhausted, unable to trigger
            context.player1.clickCard(context.massassiTacticalOfficer);
            context.player1.clickPrompt('Attack');
            context.player1.clickCard(context.p2Base);
            expect(context.massassiTacticalOfficer).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
