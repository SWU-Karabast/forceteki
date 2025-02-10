describe('Captain Tarkin, Full Forward Assault', function() {
    integration(function(contextRef) {
        it('Captain Tarkin\'s ability should give Overwhelm and +1/+0 to friendly vehicle unit', function () {
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
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player2.passAction();

            // a non-vehicle unit attack, does not get +1/+0 and overwhelm
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.craftySmuggler);

            expect(context.p2Base.damage).toBe(2);
        });
    });
});
