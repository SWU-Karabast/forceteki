describe('General\'s Blade', function () {
    integration(function (contextRef) {
        it('General\'s Blade\'s ability should give a 2 cost reduction for the next unit we play', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'smugglers-aid'],
                    groundArena: [{ card: 'obiwan-kenobi#following-fate', upgrades: ['generals-blade'] }],
                    base: 'echo-base',
                    leader: 'cassian-andor#dedicated-to-the-rebellion'
                },
            });

            const { context } = contextRef;

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            // play an event with normal cost
            context.player1.clickCard(context.smugglersAid);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            // play wampa, he should cost 2 less
            context.player1.clickCard(context.wampa);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            context.player2.passAction();

            // play battlefield marine with normal cost
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('General\'s Blade\'s ability should give a 2 cost reduction for the next unit we play only for the phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'smugglers-aid'],
                    groundArena: [{ card: 'obiwan-kenobi#following-fate', upgrades: ['generals-blade'] }],
                    base: 'echo-base',
                    leader: 'cassian-andor#dedicated-to-the-rebellion'
                },
            });

            const { context } = contextRef;

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            context.moveToNextActionPhase();

            // play an event with normal cost
            context.player1.clickCard(context.smugglersAid);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            // play wampa with normal cost
            context.player1.clickCard(context.wampa);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            context.player2.passAction();

            // play battlefield marine with normal cost
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(7);
        });
    });
});
