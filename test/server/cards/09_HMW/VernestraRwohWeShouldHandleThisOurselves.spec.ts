describe('Vernestra Rwoh, We Should Handle This Ourselves', function() {
    integration(function(contextRef) {
        describe('her additional play cost and pre-enter-play ability', function() {
            describe('when the discard pile has a mix of valid and invalid targets', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                            discard: ['veteran-fleet-officer', 'youngling-padawan', 'repair', 'atst'],
                            deck: ['wampa']
                        },
                        player2: {}
                    });
                });

                it('copies both When Played abilities when two different units are chosen', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);

                    // only units costing 5 or less are selectable; the event and the 6-cost AT-ST are excluded
                    expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, context.younglingPadawan]);

                    context.player1.clickCard(context.veteranFleetOfficer);
                    context.player1.clickCard(context.younglingPadawan);
                    context.player1.clickPrompt('Done');

                    // both chosen units were moved to the bottom of the deck; the rest of the discard is untouched
                    expect(context.veteranFleetOfficer).toBeInZone('deck');
                    expect(context.younglingPadawan).toBeInZone('deck');
                    expect(context.repair).toBeInZone('discard');
                    expect(context.atst).toBeInZone('discard');

                    // both copied "When Played" abilities trigger; resolve them in either order
                    context.player1.clickPrompt('Create an X-Wing token');

                    expect(context.vernestraRwoh).toBeInZone('groundArena');
                    expect(context.player1.findCardsByName('xwing').length).toBe(1);
                    expect(context.player1.hasTheForce).toBe(true);
                    expect(context.player2).toBeActivePlayer();
                });

                it('copies the When Played ability of a single chosen unit', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);
                    context.player1.clickCard(context.veteranFleetOfficer);
                    context.player1.clickPrompt('Done');

                    expect(context.veteranFleetOfficer).toBeInZone('deck');
                    expect(context.younglingPadawan).toBeInZone('discard');
                    expect(context.repair).toBeInZone('discard');
                    expect(context.atst).toBeInZone('discard');

                    // only Veteran Fleet Officer's "Create an X-Wing token" ability was copied
                    expect(context.vernestraRwoh).toBeInZone('groundArena');
                    expect(context.player1.findCardsByName('xwing').length).toBe(1);
                    expect(context.player1.hasTheForce).toBe(false);
                    expect(context.player2).toBeActivePlayer();
                });

                it('lets the player choose nothing even though valid targets exist', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);
                    expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, context.younglingPadawan]);
                    context.player1.clickPrompt('Choose nothing');

                    // nothing moved out of the discard pile
                    expect(context.veteranFleetOfficer).toBeInZone('discard');
                    expect(context.younglingPadawan).toBeInZone('discard');
                    expect(context.repair).toBeInZone('discard');
                    expect(context.atst).toBeInZone('discard');

                    // no When Played ability was copied, so nothing triggers on entering play
                    expect(context.vernestraRwoh).toBeInZone('groundArena');
                    expect(context.player1.findCardsByName('xwing').length).toBe(0);
                    expect(context.player1.hasTheForce).toBe(false);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when only one valid unit is in the discard pile', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                            discard: ['favorable-delegate'],
                            deck: ['wampa']
                        },
                        player2: {}
                    });
                });

                it('is still playable and copies that unit\'s When Played ability', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);
                    expect(context.player1).toBeAbleToSelectExactly([context.favorableDelegate]);
                    context.player1.clickCard(context.favorableDelegate);
                    context.player1.clickPrompt('Done');

                    expect(context.favorableDelegate).toBeInZone('deck');
                    expect(context.vernestraRwoh).toBeInZone('groundArena');

                    // Vernestra gained Favorable Delegate's "When Played: Draw a card" ability, drawing the deck's top card
                    expect(context.wampa).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when the discard pile is empty', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                            deck: ['wampa']
                        },
                        player2: {}
                    });
                });

                it('is still playable as a vanilla unit with no additional cost paid', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.vernestraRwoh);

                    // no cost selection prompt appears since there are no valid targets; she enters play immediately
                    expect(context.vernestraRwoh).toBeInZone('groundArena');
                    expect(context.wampa).toBeInZone('deck');
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('when Vernestra is blanked in hand (all abilities lost)', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win']
                    },
                    player2: {
                        hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                        discard: ['favorable-delegate'],
                        deck: ['wampa']
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

        describe('when played from her own discard pile via Palpatine\'s Return', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#oversector-governor',
                        base: 'administrators-tower',
                        hand: ['palpatines-return'],
                        discard: ['vernestra-rwoh#we-should-handle-this-ourselves', 'veteran-fleet-officer', 'youngling-padawan']
                    },
                    player2: {}
                });
            });

            it('cannot select herself for the additional cost, but can select other units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.palpatinesReturn);

                // all units in the discard pile are valid targets for Palpatine's Return
                expect(context.player1).toBeAbleToSelectExactly([
                    context.vernestraRwoh,
                    context.veteranFleetOfficer,
                    context.younglingPadawan
                ]);
                context.player1.clickCard(context.vernestraRwoh);

                // Vernestra is a Force unit, so her cost of 6 is fully covered by the 8-less discount, making her free to play;
                // her additional cost now triggers, but she's no longer in the discard pile, so she can't select herself
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, context.younglingPadawan]);
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player1.clickPrompt('Done');

                expect(context.veteranFleetOfficer).toBeInZone('deck');
                expect(context.younglingPadawan).toBeInZone('discard');

                expect(context.vernestraRwoh).toBeInZone('groundArena', context.player1);
                // Palpatine's Return itself costs 6 (no aspect penalty); Vernestra's own cost was fully discounted to 0
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('when an opponent plays Vernestra from the controller\'s resources via Tear This Ship Apart', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                        hand: ['tear-this-ship-apart'],
                        discard: ['veteran-fleet-officer', 'repair', 'atst']
                    },
                    player2: {
                        resources: ['vernestra-rwoh#we-should-handle-this-ourselves', 'wampa']
                    }
                });
            });

            it('prompts the playing player for the additional cost, drawn from their own discard pile', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.vernestraRwoh, context.wampa],
                    invalid: []
                });
                context.player1.clickCardInDisplayCardPrompt(context.vernestraRwoh);

                // player1 is playing the card, so player1's own discard pile is used for the additional cost,
                // not player2's (the owner/original controller of the resourced Vernestra)
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer]);
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player1.clickPrompt('Done');

                expect(context.veteranFleetOfficer).toBeInZone('deck', context.player1);
                expect(context.repair).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player1);

                // Vernestra enters play under player1's control (the one who played her for free)
                expect(context.vernestraRwoh).toBeInZone('groundArena', context.player1);
                // Tear This Ship Apart itself costs 7 (no aspect penalty); Vernestra was played for free
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
