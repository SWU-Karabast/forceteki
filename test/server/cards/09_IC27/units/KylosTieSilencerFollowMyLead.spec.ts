describe('Kylo\'s Tie Silencer, Follow My Lead', () => {
    integration(function(contextRef) {
        describe('Its triggered ability', function() {
            it('when discarded from hand, can be played from discard by its owner for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylos-tie-silencer#follow-my-lead']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['ahsoka-tano#chasing-whispers']
                    }
                });

                const { context } = contextRef;

                // P2 plays Ahsoka, forcing P1 to discard Kylo's Tie Silencer
                context.player2.clickCard(context.ahsokaTano);
                expect(context.player1).toHavePrompt('Choose a card to discard for Ahsoka Tano\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // Verify the ongoing effect is active
                expect(context.kylosTieSilencer).toHaveExactOngoingEffectsForPlayer(context.player1, [{
                    description: 'For this phase, you may play Kylo\'s TIE Silencer from your discard pile',
                    targets: [context.kylosTieSilencer]
                }]);

                // P1 should now have the option to play Kylo's Tie Silencer from discard
                expect(context.player1).toBeAbleToSelect(context.kylosTieSilencer);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
            });

            it('cannot be played by the opponent from the discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'kylos-tie-silencer#follow-my-lead',
                            'bix-caleen#selling-scrap'
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 plays Bix and discards Kylo's TIE Silencer for her effect
                context.player1.clickCard(context.bixCaleen);
                expect(context.player1).toHavePrompt('Discard a card from your hand to create a Credit token');
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // P2 should not have the option to play Kylo's Tie Silencer from P1's discard
                expect(context.player2).not.toBeAbleToSelect(context.kylosTieSilencer);
            });

            it('when discarded from hand, cannot be played in the following round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylos-tie-silencer#follow-my-lead']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['ahsoka-tano#chasing-whispers']
                    }
                });

                const { context } = contextRef;

                // P2 plays Ahsoka, forcing P1 to discard Kylo's Tie Silencer
                context.player2.clickCard(context.ahsokaTano);
                expect(context.player1).toHavePrompt('Choose a card to discard for Ahsoka Tano\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // Verify the ongoing effect is active
                expect(context.kylosTieSilencer).toHaveExactOngoingEffectsForPlayer(context.player1, [{
                    description: 'For this phase, you may play Kylo\'s TIE Silencer from your discard pile',
                    targets: [context.kylosTieSilencer]
                }]);

                // Move to the next action phase
                context.player1.claimInitiative();
                context.moveToNextActionPhase();

                // The ongoing effect is no longer active
                expect(context.kylosTieSilencer).toHaveNoOngoingEffectsForPlayer(context.player1);
                expect(context.player1).not.toBeAbleToSelect(context.kylosTieSilencer);
            });

            it('when discarded from deck, cannot be played from discard', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['kylos-tie-silencer#follow-my-lead'],
                        groundArena: ['bt1#blastomech']
                    }
                });

                const { context } = contextRef;

                // P1 attacks with BT-1, discarding Kylo's TIE Silencer from their deck
                context.player1.clickCard(context.bt1);
                context.player1.clickCard(context.p2Base);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                context.player2.passAction();

                // Verify the ongoing effect is not active
                expect(context.kylosTieSilencer).toHaveNoOngoingEffectsForPlayer(context.player1);
                expect(context.player1).not.toBeAbleToSelect(context.kylosTieSilencer);
            });

            it('can still be played if it is discarded in a batch with other cards from hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'kylos-tie-silencer#follow-my-lead',
                            'bt1#blastomech',
                            'open-fire',
                            'black-one#scourge-of-starkiller-base'
                        ],
                    }
                });

                const { context } = contextRef;

                // P1 plays Black One and discards their whole hand for its effect
                context.player1.clickCard(context.blackOne);
                context.player1.clickPrompt('Trigger');

                expect([
                    context.kylosTieSilencer,
                    context.bt1,
                    context.openFire
                ]).toAllBeInZone('discard', context.player1);

                // Verify the ongoing effect is active
                expect(context.kylosTieSilencer).toHaveExactOngoingEffectsForPlayer(context.player1, [{
                    description: 'For this phase, you may play Kylo\'s TIE Silencer from your discard pile',
                    targets: [context.kylosTieSilencer]
                }]);

                context.player2.passAction();

                // Verify that Kylo's TIE Silencer can still be played from the discard pile
                expect(context.player1).toBeAbleToSelect(context.kylosTieSilencer);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
            });

            it('the effect does not prevent other \'play from discard\' effects from targeting it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'kylos-tie-silencer#follow-my-lead',
                            'nightbrother#mauls-gauntlet'
                        ]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['ahsoka-tano#chasing-whispers']
                    }
                });

                const { context } = contextRef;

                // P2 plays Ahsoka, forcing P1 to discard Kylo's Tie Silencer
                context.player2.clickCard(context.ahsokaTano);
                expect(context.player1).toHavePrompt('Choose a card to discard for Ahsoka Tano\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer, context.nightbrother]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // Verify the ongoing effect is active
                expect(context.kylosTieSilencer).toHaveExactOngoingEffectsForPlayer(context.player1, [{
                    description: 'For this phase, you may play Kylo\'s TIE Silencer from your discard pile',
                    targets: [context.kylosTieSilencer]
                }]);

                // P1 plays Nightbrother, allowing them to play a card from their discard pile
                context.player1.clickCard(context.nightbrother);
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
            });

            it('the effect is removed if it is played and then re-enters the discard pile in the same phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylos-tie-silencer#follow-my-lead']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['ahsoka-tano#chasing-whispers', 'vanquish']
                    }
                });

                const { context } = contextRef;

                // P2 plays Ahsoka, forcing P1 to discard Kylo's Tie Silencer
                context.player2.clickCard(context.ahsokaTano);
                expect(context.player1).toHavePrompt('Choose a card to discard for Ahsoka Tano\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([context.kylosTieSilencer]);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // Verify the ongoing effect is active
                expect(context.kylosTieSilencer).toHaveExactOngoingEffectsForPlayer(context.player1, [{
                    description: 'For this phase, you may play Kylo\'s TIE Silencer from your discard pile',
                    targets: [context.kylosTieSilencer]
                }]);

                // P1 should now have the option to play Kylo's Tie Silencer from discard
                expect(context.player1).toBeAbleToSelect(context.kylosTieSilencer);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);

                // P2 plays Vanquish to defeat Kylo's Tie Silencer
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // Verify the ongoing effect is not active
                expect(context.kylosTieSilencer).toHaveNoOngoingEffectsForPlayer(context.player1);
                expect(context.player1).not.toBeAbleToSelect(context.kylosTieSilencer);
            });
        });
    });
});
