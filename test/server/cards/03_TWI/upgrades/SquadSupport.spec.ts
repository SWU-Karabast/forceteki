describe('Squad Support', function() {
    integration(function(contextRef) {
        it('Squad Support\'s ability should give +1/+1 to the attached unit for each Trooper you control', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['squad-support'],
                    groundArena: ['battlefield-marine', 'advanced-recon-commando', 'regional-governor'],
                    spaceArena: ['alliance-xwing'],
                    leader: { card: 'finn#this-is-a-rescue', deployed: true }
                },
                player2: {
                    groundArena: ['death-star-stormtrooper'],
                    spaceArena: ['tie-advanced']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.squadSupport);
            expect(context.player1).toBeAbleToSelectExactly(
                [
                    'battlefield-marine',
                    'advanced-recon-commando',
                    'regional-governor',
                    'alliance-xwing',
                    context.deathStarStormtrooper,
                    context.tieAdvanced
                ]
            ); // Only leader Finn can't be selected
            context.player1.clickCard(context.advancedReconCommando);
            expect(context.advancedReconCommando.getPower()).toBe(7);
            expect(context.advancedReconCommando.getHp()).toBe(6);

            // The unit gains +1/+1 for each Trooper unit you control not the upgrade
            expect(context.squadSupport.getPower()).toBe(0);
            expect(context.squadSupport.getHp()).toBe(0);

            // When a Trooper unit is defeated attached unit should lose +1/+1
            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.advancedReconCommando.getPower()).toBe(6);
            expect(context.advancedReconCommando.getHp()).toBe(5);
        });
    });
});
