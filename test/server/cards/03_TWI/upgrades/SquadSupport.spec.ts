
describe('Squad Support', function() {
    integration(function(contextRef) {
        describe('Squad Support\'s ability', function() {
            it('should give +1/+1 to the attached unit for each Trooper you control', function () {
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

            // TODO: test with Evidence of the Crime to confirm that the amount updates correctly
            });

            it('should not give any bonus if there is no Trooper', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['squad-support', 'battlefield-marine', 'advanced-recon-commando'],
                        groundArena: ['regional-governor'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['tie-advanced']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.squadSupport);
                expect(context.player1).toBeAbleToSelectExactly(
                    [
                        'regional-governor',
                        'alliance-xwing',
                        context.deathStarStormtrooper,
                        context.tieAdvanced
                    ]
                );
                // With not trooper in play the attached unit should not get any bonus
                context.player1.clickCard(context.regionalGovernor);
                expect(context.regionalGovernor.getPower()).toBe(1);
                expect(context.regionalGovernor.getHp()).toBe(4);

                // We play a Trooper
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.regionalGovernor.getPower()).toBe(2);
                expect(context.regionalGovernor.getHp()).toBe(5);

                // We deal 4 domage to the regional governor
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.regionalGovernor);
                expect(context.regionalGovernor.getPower()).toBe(2);
                expect(context.regionalGovernor.getHp()).toBe(5);
                expect(context.regionalGovernor.damage).toBe(4);

                // We kill the battlefield marine and the regional governor should left play too
                context.player1.passAction();
                context.player2.clickCard(context.deathStarStormtrooper);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.regionalGovernor).toBeInZone('discard');
                expect(context.squadSupport).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.deathStarStormtrooper).toBeInZone('discard');
            });
        });
    });
});
