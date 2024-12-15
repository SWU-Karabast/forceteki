describe('Outspoken Representative', function () {
    integration(function (contextRef) {
        it('should gain Sentinel', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['clone-heavy-gunner'],
                    groundArena: ['outspoken-representative'],
                },
                player2: {
                    groundArena: ['specforce-soldier', 'volunteer-soldier'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            // Check if sentinel is not yet active
            context.player2.clickCard(context.specforceSoldier);
            expect(context.player2).toBeAbleToSelectExactly([context.outspokenRepresentative, context.p1Base]);
            context.player2.clickCard(context.outspokenRepresentative);

            // Check if sentinel is now active
            context.player1.clickCard(context.cloneHeavyGunner);
            context.player2.clickCard(context.volunteerSoldier);
            expect(context.player2).toBeAbleToSelectExactly([context.outspokenRepresentative]);
            context.player2.clickCard(context.outspokenRepresentative);
        });
        it('should create a Clone Trooper token when defeated', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['outspoken-representative'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.outspokenRepresentative);
            context.player1.clickCard(context.battlefieldMarine);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
        });
    });
});