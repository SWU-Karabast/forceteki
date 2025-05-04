describe('Obi-Wan Kenobi, Protective Padawan', function() {
    integration(function(contextRef) {
        it('Obi-Wan Kenobi\'s ability should give him Sentinel when you play a Force unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['obiwan-kenobi#protective-padawan', 'drain-essence', 'daughter-of-dathomir'],
                },
                player2: {
                    hand: ['shaak-ti#unity-wins-wars'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeTrue();

            context.moveToNextActionPhase();
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeFalse();

            context.player1.clickCard(context.drainEssence);
            context.player1.clickCard(context.obiwanKenobi);
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeFalse();

            context.player2.clickCard(context.shaakTi);
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeFalse();

            context.player1.clickCard(context.daughterOfDathomir);
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeTrue();

            context.moveToNextActionPhase();
            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeFalse();
        });
    });
});