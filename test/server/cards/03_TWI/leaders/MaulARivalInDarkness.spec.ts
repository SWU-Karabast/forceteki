describe('Maul, A Rival In Darkness', function() {
    integration(function(contextRef) {
        describe('Maul, A Rival In Darkness\'s undeployed leader ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'scout-bike-pursuer'],
                        leader: 'maul#a-rival-in-darkness',
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    },
                });
            });

            it('should attack with a unit and it gains Overwhelm', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maulARivalInDarkness);
                context.player1.clickPrompt('Attack with a unit. It gains Overwhelm for this attack');

                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(1);
            });
        });

        describe('Maul, A Rival In Darkness\'s leader deployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'zuckuss#bounty-hunter-for-hire'],
                        leader: { card: 'maul#a-rival-in-darkness', deployed: true },
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'wampa']
                    },
                });
            });

            it('should give Overwhelm to all friendly units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.zuckussBountyHunterForHire);
                context.player1.clickCard(context.wampa);

                expect(context.p2Base.damage).toBe(1);

                context.player2.passAction();
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
