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

        it('Obi-Wan Kenobi\'s ability should give him Sentinel when you play an opponent-owned Force unit with Unrefusable Offer', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['obiwan-kenobi#protective-padawan', 'wampa'],
                },
                player2: {
                    groundArena: ['anakin-skywalker#ill-try-spinning'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.anakinSkywalker);

            context.player2.passAction();

            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeFalse();

            // Defeat Anakin and collect the bounty to play him under player1's control
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.anakinSkywalker);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');
            expect(context.anakinSkywalker).toBeInZone('groundArena', context.player1);

            expect(context.obiwanKenobi.hasSomeKeyword('sentinel')).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});