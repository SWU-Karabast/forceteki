describe('Card highlighting', function() {
    integration(function(contextRef) {
        describe('Card highlighting', function() {
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
                let currentPossibleActions = context.player1.currentPrompt();

                const reset = () => {
                    currentPossibleActions = context.player1.currentPrompt();
                };

                // attack action
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.deathTrooper);
                context.player2.claimInitiative();
                expect(context.player1.currentPrompt()).not.toEqual(currentPossibleActions);

                reset();

                // smuggle action
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.player1.currentPrompt()).not.toEqual(currentPossibleActions);

                reset();

                // play from hand action
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.currentPrompt()).not.toEqual(currentPossibleActions);

                reset();

                // steal mercenary gunship TODO wait till the gunship is implemented
                /* expect(context.player1.countSpendableResources()).toBe(4);
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1.currentPrompt()).not.toEqual(currentPossibleActions);*/
            });
        });
    });
});
