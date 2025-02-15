describe('Rampart, Enjoy the Exit', function () {
    integration(function (contextRef) {
        it('Rampart, Enjoy the Exit\'s ability should not ready on regroup until he has 4 power or more', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['smuggling-compartment', 'keep-fighting'],
                    spaceArena: ['rampart#enjoy-the-exit', 'cartel-spacer'],
                    groundArena: ['crafty-smuggler']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // exhaust all units
            context.rampart.exhausted = true;
            context.cartelSpacer.exhausted = true;
            context.craftySmuggler.exhausted = true;
            context.greenSquadronAwing.exhausted = true;

            // ready rampart with an ability
            context.player1.clickCard(context.keepFighting);
            context.player1.clickCard(context.rampart);

            expect(context.rampart.exhausted).toBeFalse();

            context.rampart.exhausted = true;

            context.moveToNextActionPhase();

            // rampart should not ready in regroup phase because he does not have 4 power or more
            expect(context.rampart.exhausted).toBeTrue();
            expect(context.cartelSpacer.exhausted).toBeFalse();
            expect(context.craftySmuggler.exhausted).toBeFalse();
            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            // give an upgrade to rampart
            context.player1.clickCard(context.smugglingCompartment);
            context.player1.clickCard(context.rampart);

            context.moveToNextActionPhase();

            // rampart should be ready
            expect(context.rampart.exhausted).toBeFalse();
        });
    });
});
