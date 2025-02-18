describe('Rampart, Enjoy the Exit', function () {
    integration(function (contextRef) {
        it('Rampart, Enjoy the Exit\'s ability should not ready on regroup phase until he has 4 power or more', async function () {
            await contextRef.setupTestAsync({
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

        it('Rampart, Enjoy the Exit\'s ability should ready on regroup phase because Huyang give him +2/+2', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['huyang#enduring-instructor'],
                    spaceArena: ['rampart#enjoy-the-exit', 'cartel-spacer'],
                },
                player2: {
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            // exhaust all units
            context.rampart.exhausted = true;
            context.cartelSpacer.exhausted = true;

            // play huyang and give rampart +2/+2
            context.player1.clickCard(context.huyang);
            context.player1.clickCard(context.rampart);

            expect(context.rampart.getPower()).toBe(5);

            context.moveToNextActionPhase();

            expect(context.rampart.exhausted).toBeFalse();
            expect(context.cartelSpacer.exhausted).toBeFalse();
            expect(context.huyang.exhausted).toBeFalse();

            // exhaust all units
            context.rampart.exhausted = true;
            context.cartelSpacer.exhausted = true;

            // kill huyang
            context.player1.passAction();
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.huyang);

            expect(context.rampart.getPower()).toBe(3);

            context.moveToNextActionPhase();

            // rampart had lost +2/+2 from huyang, he does not ready during regroup phase
            expect(context.rampart.exhausted).toBeTrue();
            expect(context.cartelSpacer.exhausted).toBeFalse();
        });

        it('Rampart, Enjoy the Exit\'s ability should not ready on regroup because lasting effect expire at the end of action phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tactical-advantage'],
                    spaceArena: ['rampart#enjoy-the-exit', 'cartel-spacer'],
                },
            });

            const { context } = contextRef;

            // exhaust all units
            context.rampart.exhausted = true;
            context.cartelSpacer.exhausted = true;

            // give a boost to rampart
            context.player1.clickCard(context.tacticalAdvantage);
            context.player1.clickCard(context.rampart);

            expect(context.rampart.getPower()).toBe(5);

            context.moveToNextActionPhase();

            // boost expire at the end of phase, rampart should not be ready during regroup phase
            expect(context.rampart.exhausted).toBeTrue();
            expect(context.cartelSpacer.exhausted).toBeFalse();

            expect(context.rampart.getPower()).toBe(3);
        });
    });
});
