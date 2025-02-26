describe('Captain Rex, Fighting for his Brothers', function () {
    integration(function (contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'captain-rex#fighting-for-his-brothers',
                    groundArena: ['advanced-recon-commando'],
                    resources: 5
                },
                player2: {
                    groundArena: ['droid-commando']
                }
            });
        });

        it('Captain Rex\'s leader undeployed ability should create a Clone Tropper when a friendly unit attacked this phase', function () {
            const { context } = contextRef;

            // Leader ability should be available, but should not create a Clone Trooper since an enemy unit attacked this phase
            context.player1.passAction();
            context.player2.clickCard(context.droidCommando);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.captainRex);
            context.player1.clickPrompt('If a friendly unit attacked this phase, create a Clone Trooper token.');

            expect(context.captainRex.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player1.findCardsByName('clone-trooper').length).toBe(0);

            context.moveToNextActionPhase();

            // Leader ability should be available and should create a Clone Trooper since a friendly unit attacked this phase
            context.player1.clickCard(context.advancedReconCommando);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();
            context.player1.clickCard(context.captainRex);
            context.player1.clickPrompt('If a friendly unit attacked this phase, create a Clone Trooper token.');

            expect(context.captainRex.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(2);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena', context.player1);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
        });

        it('Captain Rex\'s leader deployed ability should create a Clone Tropper on deploy and each friendly Trooper has 0/+1', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.captainRex);
            context.player1.clickPrompt('Deploy Captain Rex');

            expect(context.advancedReconCommando.getPower()).toBe(4);
            expect(context.advancedReconCommando.getHp()).toBe(4);
            expect(context.droidCommando.getPower()).toBe(4);
            expect(context.droidCommando.getHp()).toBe(3);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers[0].getHp()).toBe(3);
            expect(cloneTroopers).toAllBeInZone('groundArena', context.player1);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
        });
    });
});