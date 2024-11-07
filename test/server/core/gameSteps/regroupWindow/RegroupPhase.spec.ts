describe('Regroup phase', function() {
    integration(function(contextRef) {
        describe('Regroup phase', function() {
            it('should let both players draw 2 cards, choose what to put into resources and ready all exhausted units.',
                function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            resources: ['smugglers-aid', 'atst', 'atst', 'atst'],
                            deck: ['foundling', 'atst', 'cartel-spacer', 'atst'],
                            hand: ['moment-of-peace', 'wroshyr-tree-tender', 'attack-pattern-delta'],
                            groundArena: ['ardent-sympathizer', 'baze-malbus#temple-guardian'],
                            spaceArena: ['alliance-xwing'],
                        },
                        player2: {
                            resources: ['smugglers-aid', 'atst', 'atst', 'atst'],
                            deck: ['pyke-sentinel', 'cartel-spacer', 'atst'],
                            hand: ['scout-bike-pursuer'],
                            groundArena: ['wampa'],
                            base: { card: 'dagobah-swamp', damage: 0 },
                            spaceArena: ['tieln-fighter'],
                        }
                    });

                    const { context } = contextRef;

                    // old hand & deck setup
                    const oldHandPlayer1 = [...context.player1.hand];
                    const oldHandPlayer2 = [...context.player2.hand];
                    const oldDeckPlayer1 = [...context.player1.deck];
                    const oldDeckPlayer2 = [...context.player2.deck];
                    const oldResourcesPlayer1 = [...context.player1.resources];
                    const oldResourcesPlayer2 = [...context.player2.resources];

                    // Setup for Case 1
                    context.allianceXwing.exhausted = true;
                    context.wampa.exhausted = true;
                    context.tielnFighter.exhausted = true;

                    // Case 1 check if regroup phase flows correctly
                    context.player1.passAction();
                    context.player2.claimInitiative();

                    // Regroup phase is divided into 3 steps draw cards, resource a card and ready cards.
                    // Draw cards
                    expect(context.player1.hand.length).toBe(5);
                    expect(context.player2.hand.length).toBe(3);

                    // Combine the old hands to see if the cards are correct in hands
                    oldHandPlayer1.push(oldDeckPlayer1[0], oldDeckPlayer1[1]);
                    oldHandPlayer2.push(oldDeckPlayer2[0], oldDeckPlayer2[1]);
                    expect(context.player1.hand).toEqual(oldHandPlayer1);
                    expect(context.player2.hand).toEqual(oldHandPlayer2);

                    // exhausted units need to be exhausted until the ready card phase
                    expect(context.allianceXwing.exhausted).toBe(true);
                    expect(context.wampa.exhausted).toBe(true);
                    expect(context.tielnFighter.exhausted).toBe(true);

                    // Resource a Card
                    // Player 1 Resources a card and Player 2 doesn't

                    // we check that player1 and player2 hands are the only selectable
                    expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                    expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);

                    // click card to resource
                    context.player1.clickCard('wroshyr-tree-tender');

                    // We check that player1 cannot select another card
                    context.player1.clickCardNonChecking(context.player1.hand[0]);
                    expect(context.player1.selectedCards.length).toBe(1);

                    // this is the index of wroshyr-tree-tender
                    oldResourcesPlayer1.push(context.wroshyrTreeTender);

                    // we check that both players have the correct prompt
                    expect(context.player1).toHaveExactPromptButtons(['Done']);
                    expect(context.player2).toHaveExactPromptButtons(['Done']);

                    context.player1.clickPrompt('Done');
                    expect(context.player1).toHavePrompt('Waiting for opponent to choose cards to resource');
                    expect(context.player2).toHaveExactPromptButtons(['Done']);
                    context.player2.clickPrompt('Done');

                    // check resources
                    expect(context.player1.resources.length).toBe(5);
                    expect(context.player2.hand).toEqual(oldHandPlayer2);
                    expect(context.player1.resources).toEqual(oldResourcesPlayer1);
                    expect(context.player2.resources).toEqual(oldResourcesPlayer2);

                    // ready card phase
                    expect(context.allianceXwing.exhausted).toBe(false);
                    expect(context.wampa.exhausted).toBe(false);
                    expect(context.tielnFighter.exhausted).toBe(false);
                    expect(context.player2).toBeActivePlayer();

                    // Case 3 player 2 can only draw 1 card and receives 3 damage to base;
                    context.player2.passAction();
                    context.player1.claimInitiative();

                    // Draw cards
                    expect(context.player1.hand.length).toBe(6);
                    expect(context.player2.hand.length).toBe(4);

                    // Resources
                    context.player2.clickPrompt('Done');
                    context.player1.clickPrompt('Done');

                    // check board state
                    expect(context.player2.deck.length).toBe(0);
                    expect(context.p2Base.damage).toBe(3);
                }
            );

            it('should end all "for this phase" abilities',
                function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['attack-pattern-delta'],
                            groundArena: ['ardent-sympathizer', 'scout-bike-pursuer', 'general-krell#heartless-tactician'],
                            spaceArena: ['alliance-xwing'],
                        },
                        player2: {
                            groundArena: ['wampa'],
                        }
                    });

                    const { context } = contextRef;

                    // Play card Attack pattern delta
                    context.player1.clickCard(context.attackPatternDelta);
                    // Select Ardent Sympathizer to get +3/+3
                    context.player1.clickCard(context.ardentSympathizer);
                    // Select Scout Bike Pursuer to get +2/+2
                    context.player1.clickCard(context.scoutBikePursuer);
                    // Select General Krell to receive +1/+1
                    context.player1.clickCard(context.generalKrell);

                    // Select wampa to attack Ardent Sympathizer,
                    // attack damage is enough to defeat Ardent Sympathizer when the effect expires
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.ardentSympathizer);

                    // check board state
                    expect(context.ardentSympathizer.damage).toBe(4);
                    expect(context.wampa.location).toBe('discard');

                    // Move to regroup phase
                    expect(context.ardentSympathizer.location).toBe('ground arena');
                    context.player1.passAction();
                    context.player2.claimInitiative();

                    // We check the timing of General Krells "When Defeated"
                    expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                    context.player1.clickPrompt('Draw a card');

                    // Check board state
                    expect(context.ardentSympathizer.location).toBe('discard');
                    expect(context.scoutBikePursuer.getPower()).toBe(1);
                    expect(context.allianceXwing.getPower()).toBe(2);
                }
            );
        });
    });
});
