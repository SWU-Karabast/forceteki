describe('Grim Resolve', function() {
    integration(function(contextRef) {
        it('Grim Resolve\'s ability should attack with a non-leader unit and grant Grit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['grim-resolve', 'grim-resolve'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa']
                }
            });

            const { context } = contextRef;

            const wampa = context.player1.findCardByName('wampa');
            const marine = context.player1.findCardByName('battlefield-marine');
            const p2Base = context.player2.base;

            let grimResolve = context.player1.hand[0];
            context.player1.clickCard(grimResolve);
            context.player1.clickCard(marine);
            context.player1.clickCard(p2Base);
            expect(p2Base.damage).toBe(5);

            context.player2.passAction();

            grimResolve = context.player1.hand[0];
            context.player1.clickCard(grimResolve);
            context.player1.clickCard(wampa);
            context.player1.clickCard(p2Base);
            expect(p2Base.damage).toBe(9);
        });
    });
});