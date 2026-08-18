describe('Vernestra Rwoh, We Should Handle This Ourselves', function() {
    integration(function(contextRef) {
        describe('her additional play cost', function() {
            describe('when one unit is chosen', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                            discard: ['favorable-delegate'],
                            deck: ['wampa'],
                            resources: 20
                        },
                        player2: {}
                    });
                });

                it('puts the chosen unit on the bottom of the deck and gains its When Played ability', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);

                    // additional cost: choose up to 2 units (cost <= 5) from discard to put on the bottom of the deck
                    context.player1.clickCard(context.favorableDelegate);
                    context.player1.clickPrompt('Done');

                    // the play message renders the cost verb ("moving", not "move")
                    expect(context.getChatLogs(3)).toContain('player1 plays Vernestra Rwoh, moving a card to the bottom of their deck');

                    // the cost was paid: the chosen unit is now in the deck (bottom)
                    expect(context.favorableDelegate).toBeInZone('deck');
                    expect(context.vernestraRwoh).toBeInZone('groundArena');

                    // Vernestra gained Favorable Delegate's "When Played: Draw a card" ability, which drew from the top
                    expect(context.wampa).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when two units are chosen', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                            discard: ['favorable-delegate', 'patrolling-vwing'],
                            deck: ['wampa', 'battlefield-marine'],
                            resources: 20
                        },
                        player2: {}
                    });
                });

                it('gains the When Played ability of every chosen unit', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);

                    context.player1.clickCard(context.favorableDelegate);
                    context.player1.clickCard(context.patrollingVwing);
                    context.player1.clickPrompt('Done');

                    // both copied "When Played: Draw a card" abilities trigger; resolve them in order
                    context.player1.clickPrompt('Draw a card');

                    // both chosen units were moved to the bottom of the deck
                    expect(context.favorableDelegate).toBeInZone('deck');
                    expect(context.patrollingVwing).toBeInZone('deck');

                    // Vernestra gained both "When Played: Draw a card" abilities, so both top-of-deck cards were drawn
                    expect(context.wampa).toBeInZone('hand');
                    expect(context.battlefieldMarine).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('when Vernestra is blanked in hand (all abilities lost)', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        resources: 20
                    },
                    player2: {
                        hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                        discard: ['favorable-delegate'],
                        deck: ['wampa'],
                        resources: 20
                    }
                });
            });

            it('loses her additional play cost and pre-enter-play ability, playing as a vanilla unit', function() {
                const { context } = contextRef;

                // Galen Erso names Vernestra, blanking her in player2's hand (including out of play)
                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Vernestra Rwoh');

                // player2 plays the blanked Vernestra: no additional cost prompt, no gained "When Played" ability
                context.player2.clickCard(context.vernestraRwoh);

                // the additional cost was not charged: the discard unit stays put
                expect(context.favorableDelegate).toBeInZone('discard');
                // no copied "When Played: Draw a card" ability fired
                expect(context.wampa).toBeInZone('deck');

                expect(context.vernestraRwoh).toBeInZone('groundArena');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
