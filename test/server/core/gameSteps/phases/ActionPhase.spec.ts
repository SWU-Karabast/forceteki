describe('Action Phase', function() {
    integration(function(contextRef) {
        describe('Action Phase', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        resources: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                        ],
                        hand: ['vanguard-infantry'],
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['mercenary-gunship']
                    }
                });
            });

            it('the prompt before an action and after should be different.', function () {
                const { context } = contextRef;

                // attack action
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.deathTrooper);
                context.player2.claimInitiative();
                expect(context.player1.currentActionTargets).not.toContain(context.wampa);

                // smuggle action
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.player1.currentActionTargets).not.toContain(context.collectionsStarhopper);

                // play from hand action
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.currentActionTargets).not.toContain(context.vanguardInfantry);

                // steal mercenary gunship TODO wait till the gunship is implemented
                /* expect(context.player1.countSpendableResources()).toBe(4);
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1.currentActionTargets).not.toContain(context.mercenaryGunship);*/

                // Play from discard pile TODO wait till Kylos Tie Silencer is implemented
                /* context.player1.clickCard(context.kylosTieSilencer);
                expect(context.player1.currentActionTargets).not.toContain(context.kylosTieSilencer);*/
            });
        });
    });
});
