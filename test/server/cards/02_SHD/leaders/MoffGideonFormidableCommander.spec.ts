describe('Moff Gideon, Formidable Commander', function() {
    integration(function(contextRef) {
        describe('Moff Gideon, Formidable Commander\'s undeployed leader ability', function() {
            it('should attack with a unit that costs 3 or less and it gains +1/+0', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['droid-commando', 'generals-guardian'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'moff-gideon#formidable-commander',
                    },
                    player2: {
                        groundArena: ['duchesss-champion']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Attack with a unit that costs 3 or less. If it\'s attacking a unit, it gets +1/+0 for this attack');

                expect(context.player1).toBeAbleToSelectExactly([context.droidCommando, context.tielnFighter]);
                context.player1.clickCard(context.droidCommando);
                context.player1.clickCard(context.duchesssChampion);
                expect(context.duchesssChampion.damage).toBe(5); // 4 Base power + 1 from Moff Gideon's ability

                context.moveToNextActionPhase();

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Attack with a unit that costs 3 or less. If it\'s attacking a unit, it gets +1/+0 for this attack');
                expect(context.player1).toBeAbleToSelectExactly([context.droidCommando, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2); // No buff from Moff Gideon's ability
            });
        });

        describe('Moff Gideon, Formidable Commander\'s leader deployed ability', function() {
            it('should give Overwhelm to friendly unit that costs 3 or less when attacking a unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'zuckuss#bounty-hunter-for-hire', 'super-battle-droid', 'greedo#slow-on-the-draw'],
                        leader: { card: 'moff-gideon#formidable-commander', deployed: true },
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'battlefield-marine', 'general-veers#blizzard-force-commander'],
                    },
                });

                const { context } = contextRef;

                expect(context.deathStarStormtrooper.getPower()).toBe(4); // (3 Base + 1 Buff)
                expect(context.superBattleDroid.getPower()).toBe(5); // (4 Base + 1 Buff)
                expect(context.zuckuss.getPower()).toBe(6); // Does not get buff from Moff Gideon's ability as it cost more than 3
                expect(context.specforceSoldier.getPower()).toBe(2); // Opponent's unit does not get buff from Moff Gideon's ability
                expect(context.battlefieldMarine.getPower()).toBe(3);

                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(2); // 4 Death Trooper Power - 2 Specforce Solider Health

                context.player2.passAction();
                context.player1.clickCard(context.zuckuss);
                context.player1.clickCard(context.generalVeers);
                expect(context.p2Base.damage).toBe(2); // Zuckuss does not get Overwhelm

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.greedo);
                context.player1.clickPrompt('Pass');
                expect(context.p1Base.damage).toBe(0); // Enemy unit does not get Overwhelm from Moff Gideon's ability
            });
        });
    });
});
