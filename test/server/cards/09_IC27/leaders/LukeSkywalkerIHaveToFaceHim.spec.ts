describe('Luke Skywalker, I Have To Face Him', function() {
    integration(function(contextRef) {
        describe('Leader ability', function() {
            const p1StartingDeck = [
                // To have specific cards to check during regroup phase (in alphabetical order)
                'air-superiority',
                'beguile',
                'choose-sides',
                'daring-raid',
                'eject',
                'face-off',
                'get-lost',
                'hello-there',
                'its-a-trap',
                'jump-to-lightspeed',
                'karabast'
            ];

            describe('Common cases', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'setup',
                        player1: {
                            leader: 'luke-skywalker#i-have-to-face-him',
                            deck: p1StartingDeck
                        }
                    });

                    const { context } = contextRef;

                    context.selectInitiativePlayer(context.player1);
                });

                it('should draw 2 extra cards during the setup phase', function () {
                    const { context } = contextRef;

                    // Draw cards step
                    expect(context.player1.handSize).toBe(8);
                    expect(context.player2.handSize).toBe(6);
                    expect(context.getChatLogs(3)).toContain('player1 draws 8 cards in their starting hand');
                    expect(context.getChatLogs(3)).toContain('player2 draws 6 cards in their starting hand');
                });

                it('should draw 2 extra cards on mulligan too', function () {
                    const { context } = contextRef;

                    // Draw cards step
                    expect(context.player1.handSize).toBe(8);
                    expect(context.player2.handSize).toBe(6);

                    context.player1.clickPrompt('Mulligan');
                    context.player2.clickPrompt('Mulligan');

                    expect(context.player1.handSize).toBe(8);
                    expect(context.player2.handSize).toBe(6);
                });

                it('should draw normally in regroup phase', function () {
                    const { context } = contextRef;

                    // Draw cards step
                    expect(context.player1.handSize).toBe(8);
                    expect(context.player2.handSize).toBe(6);
                    context.player1.clickPrompt('Keep');
                    context.player2.clickPrompt('Keep');

                    // Resource cards step
                    context.player1.clickCard(context.player1.hand[0]);
                    context.player1.clickCard(context.player1.hand[1]);
                    context.player1.clickPrompt('Done');

                    context.player2.clickCard(context.player2.hand[0]);
                    context.player2.clickCard(context.player2.hand[1]);
                    context.player2.clickPrompt('Done');

                    // Regroup phase draw
                    context.moveToRegroupPhase();
                    expect(context.player1.handSize).toBe(8); // Resourced 2, then drew 2
                    expect(context.player2.handSize).toBe(6); // Resourced 2, then drew 2
                });
            });

            describe('Interaction with other setup phase card draw effects', function () {
                it('when paired with Colossus, should draw 7 cards', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'setup',
                        player1: {
                            leader: { card: 'luke-skywalker#i-have-to-face-him' },
                            base: 'colossus',
                            deck: p1StartingDeck
                        }
                    });

                    const { context } = contextRef;

                    context.selectInitiativePlayer(context.player1);

                    // Card draw step for setup phase
                    expect(context.player1.handSize).toBe(7); // Drew 7 cards due to Luke (+2) and Colossus (-1)
                    expect(context.player2.handSize).toBe(6);
                    expect(context.getChatLogs(3)).toContain('player1 draws 7 cards in their starting hand');
                    expect(context.getChatLogs(3)).toContain('player2 draws 6 cards in their starting hand');
                });

                it('when paired with Nabat Village, draws 11, resources 2, then bottom-decks 3', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'setup',
                        player1: {
                            leader: { card: 'luke-skywalker#i-have-to-face-him' },
                            base: 'nabat-village',
                            deck: p1StartingDeck
                        }
                    });

                    const { context } = contextRef;

                    context.selectInitiativePlayer(context.player1);

                    // Card draw step for setup phase
                    expect(context.player1.handSize).toBe(11); // Drew 11 cards due to Luke (+2) and Nabat Village (+3)
                    expect(context.player2.handSize).toBe(6);
                    expect(context.getChatLogs(3)).toContain('player1 draws 11 cards in their starting hand');
                    expect(context.getChatLogs(3)).toContain('player2 draws 6 cards in their starting hand');
                    context.player2.clickPrompt('Keep');

                    // Resource cards step
                    context.player1.clickCard(context.airSuperiority);
                    context.player1.clickCard(context.beguile);
                    context.player1.clickPrompt('Done');

                    context.player2.clickCard(context.player2.hand[0]);
                    context.player2.clickCard(context.player2.hand[1]);
                    context.player2.clickPrompt('Done');

                    // Action phase begins, P1 needs to bottom-deck 3 cards due to Nabat Village
                    context.player1.clickCard(context.chooseSides);
                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.eject);
                    context.player1.clickPrompt('Done');

                    // Final hand size is 6 after drawing 11, resourcing 2, and bottom-decking 3
                    expect(context.player1.handSize).toBe(6);
                });
            });
        });

        describe('Deployed leader unit On Attack ability', function () {
            it('can optionally discard a card from hand to get +2/+0 for the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#i-have-to-face-him', deployed: true },
                        hand: [
                            'air-superiority',
                            'beguile'
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Luke Skywalker
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Ability triggers, prompting P1 to discard
                expect(context.player1).toHavePrompt('Discard a card to give Luke Skywalker +2/+0 for this attack');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);

                // Discard Air Superiority to get the buff
                context.player1.clickCard(context.airSuperiority);

                // Card is in discard pile, Luke deals 6 damage to base
                expect(context.airSuperiority).toBeInZone('discard', context.player1);
                expect(context.p2Base.damage).toBe(6);
            });

            it('can pass the discard option and attack with base power', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#i-have-to-face-him', deployed: true },
                        hand: [
                            'air-superiority',
                            'beguile'
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Luke Skywalker
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Ability triggers, prompting P1 to discard
                expect(context.player1).toHavePrompt('Discard a card to give Luke Skywalker +2/+0 for this attack');

                // P1 chooses to pass
                context.player1.clickPrompt('Pass');

                // Luke deals base damage to the base
                expect(context.p2Base.damage).toBe(4);
                expect([context.airSuperiority, context.beguile]).toAllBeInZone('hand', context.player1);
            });

            it('silently passes when the hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#i-have-to-face-him', deployed: true },
                        hand: []
                    }
                });

                const { context } = contextRef;

                // P1 attacks base with Luke Skywalker
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Ability should not prompt since hand is empty
                expect(context.player1).not.toHavePrompt('Discard a card to give Luke Skywalker +2/+0 for this attack');

                // Luke deals base damage to the base, turn passes to P2
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
