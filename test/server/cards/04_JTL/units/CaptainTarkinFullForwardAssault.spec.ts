describe('Captain Tarkin, Full Forward Assault', function() {
    integration(function(contextRef) {
        it('Blade Squadron B-Wing\'s ability should give shield to a unit if the opponent has at least 3 exhausted units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['captain-tarkin#full-forward-assault', 'battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['crafty-smuggler'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            // a vehicle unit attack, gets +1/+0 and overwhelm
            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.p2Base.damage).toBe(2);

            context.player2.passAction();

            // a non-vehicle unit attack, does not get +1/+0 and overwhelm
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.craftySmuggler);

            expect(context.p2Base.damage).toBe(2);
        });
    });
});
