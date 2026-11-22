describe('Twi\'lek Kalikori', function() {
    integration(function(contextRef) {
        describe('Twi\'lek Kalikori\'s when played ability', function() {
            it('should search the top 8 cards and play Twi\'lek units with combined cost 5 or less for free when attached to a Twi\'lek', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['twilek-kalikori'],
                        groundArena: ['coruscant-dissident'],
                        leader: 'wicket#few-greater-battles-to-fight',
                        deck: [
                            'ryloth-militia',
                            'daring-raid',
                            'reckless-rebel',
                            'numa#still-fighting',
                            'battlefield-marine',
                            'protector',
                            'strike-true',
                            'atst',
                            'wampa'
                        ]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.twilekKalikori);
                context.player1.clickCard(context.coruscantDissident);

                expect(context.player1).toHavePrompt('Choose any number of Twi\'lek units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.rylothMilitia, context.recklessRebel, context.numa],
                    invalid: [context.daringRaid, context.battlefieldMarine, context.protector, context.strikeTrue, context.atst]
                });

                context.player1.clickCardInDisplayCardPrompt(context.numa);
                context.player1.clickCardInDisplayCardPrompt(context.recklessRebel);
                context.player1.clickPrompt('Play cards in selection order');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);

                expect(context.numa).toBeInZone('groundArena', context.player1);
                expect(context.recklessRebel).toBeInZone('groundArena', context.player1);

                expect([context.rylothMilitia, context.battlefieldMarine, context.protector, context.strikeTrue, context.atst, context.daringRaid]).toAllBeInBottomOfDeck(context.player1, 6);
            });

            it('should do nothing when attached to a non-Twi\'lek unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['twilek-kalikori'],
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.twilekKalikori);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['twilek-kalikori']);
            });

            it('should allow the player to take nothing', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['twilek-kalikori'],
                        groundArena: ['coruscant-dissident'],
                        deck: [
                            'ryloth-militia',
                            'daring-raid',
                            'wampa',
                            'reckless-rebel',
                            'battlefield-marine',
                            'protector',
                            'strike-true',
                            'atst'
                        ]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.twilekKalikori);
                context.player1.clickCard(context.coruscantDissident);

                expect(context.player1).toHavePrompt('Choose any number of Twi\'lek units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect(context.rylothMilitia).toBeInBottomOfDeck(context.player1, 8);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
