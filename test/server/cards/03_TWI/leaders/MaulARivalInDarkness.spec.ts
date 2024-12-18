describe('Maul, A Rival In Darkness', function() {
    integration(function(contextRef) {
        describe('Maul, A Rival In Darkness\'s undeployed leader ability', function() {
            it('should attack with a unit and it gains Overwhelm', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['zuckuss#bounty-hunter-for-hire', 'scout-bike-pursuer'],
                        leader: 'maul#a-rival-in-darkness',
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'battlefield-marine']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.maulARivalInDarkness);
                context.player1.clickPrompt('Attack with a unit. It gains Overwhelm for this attack');

                expect(context.player1).toBeAbleToSelectExactly([context.zuckussBountyHunterForHire, context.scoutBikePursuer]);
                context.player1.clickCard(context.zuckussBountyHunterForHire);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.zuckussBountyHunterForHire.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                // Ready Zuckuss for a second attack to validate there's no Overwhelm
                context.zuckussBountyHunterForHire.exhausted = false;
                context.player2.passAction();
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.zuckussBountyHunterForHire); // Attack without Overwhelm
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('Maul, A Rival In Darkness\'s leader deployed ability', function() {
            it('should give Overwhelm to all friendly units', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'zuckuss#bounty-hunter-for-hire', 'greedo#slow-on-the-draw'],
                        leader: { card: 'maul#a-rival-in-darkness', deployed: true },
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'wampa', 'battlefield-marine']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zuckussBountyHunterForHire);
                context.player1.clickCard(context.wampa);

                expect(context.p2Base.damage).toBe(1);

                context.player2.passAction();
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.p2Base.damage).toBe(2);

                // Enemy units doesn't have Overwhelm
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.greedo);
                context.player1.clickPrompt('Pass');
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
