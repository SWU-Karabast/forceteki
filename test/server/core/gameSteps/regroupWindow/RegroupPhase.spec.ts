describe('Regroup phase', function() {
    integration(function(contextRef) {
        describe('Regroup phase', function() {
            it('should let both players draw 2 cards, choose what to put into resources and ready all exhausted units.',
                async function () {
                    await contextRef.setupTestAsync({
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
                    context.exhaustCard(context.allianceXwing);
                    context.exhaustCard(context.wampa);
                    context.exhaustCard(context.tielnFighter);

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

                    expect(context.getChatLogs(4)).toContain('player1 has resourced 1 card from hand');
                    expect(context.getChatLogs(4)).toContain('player2 has not resourced any cards');

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
                async function () {
                    await contextRef.setupTestAsync({
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
                    expect(context.wampa.zoneName).toBe('discard');

                    // Move to regroup phase
                    expect(context.ardentSympathizer.zoneName).toBe('groundArena');
                    context.player1.passAction();
                    context.player2.claimInitiative();

                    // We check the timing of General Krells "When Defeated"
                    expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                    context.player1.clickPrompt('Trigger');

                    // Check board state
                    expect(context.ardentSympathizer.zoneName).toBe('discard');
                    expect(context.scoutBikePursuer.getPower()).toBe(1);
                    expect(context.allianceXwing.getPower()).toBe(2);
                }
            );
        });

        describe('trigger windows in the regroup phase should select the initiative player as choosing player for resolution of player order', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#piece-of-junk']
                    },
                    player2: {
                        hand: ['millennium-falcon#piece-of-junk']
                    }
                });

                const { context } = contextRef;

                context.p1Falcon = context.player1.findCardByName('millennium-falcon#piece-of-junk');
                context.p2Falcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');
            });

            it('when initiative doesn\'t change hands during the action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.p1Falcon);
                context.player2.clickCard(context.p2Falcon);

                // player1 retains initiative
                context.moveToRegroupPhase();

                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('You');

                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Return this unit to her owner\'s hand');
                expect(context.p1Falcon).toBeInZone('hand');

                expect(context.player2).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player2.clickPrompt('Pay 1 resource');
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });

            it('when initiative changes hands during the action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.p1Falcon);
                context.player2.clickCard(context.p2Falcon);

                context.player1.passAction();
                context.player2.claimInitiative();

                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.player2).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player2.clickPrompt('You');

                expect(context.player2).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player2.clickPrompt('Return this unit to her owner\'s hand');
                expect(context.p2Falcon).toBeInZone('hand');

                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        it('all resources should be able to ready regardless of card type', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    hand: ['battlefield-marine'],
                    resources: ['hotshot-dl44-blaster', 'daring-raid', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);

            context.moveToNextActionPhase();

            expect(context.player1.readyResourceCount).toBe(3);
        });
    });
});
