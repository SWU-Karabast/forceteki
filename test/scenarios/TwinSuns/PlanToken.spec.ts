describe('Twin Suns Plan token', function () {
    integration(function (contextRef) {
        describe('Claim Plan token effect', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: ['wampa'],
                        deck: ['battlefield-marine', 'moment-of-peace'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        deck: ['death-star-stormtrooper'],
                    }
                });
            });

            it('draws a card, prompts to put one card on the bottom of the deck, then passes', function () {
                const { context } = contextRef;

                const handSizeBefore = context.player1Object.hand.length; // 1 (wampa)

                context.player1.clickPrompt('Claim Plan');

                // Drew 1 card (battlefield-marine) — hand has grown by 1
                expect(context.player1Object.hand.length).toBe(handSizeBefore + 1);

                // Should now be prompted to choose a card from hand to put on the bottom of the deck
                expect(context.player1).toHavePrompt('Choose a card from your hand to put on the bottom of your deck');

                // Put wampa on the bottom
                context.player1.clickCard(context.wampa);

                // Wampa is now at the bottom of the deck
                const deck = context.player1Object.drawDeck;
                expect(deck[deck.length - 1].internalName).toBe('wampa');

                // Net hand change: drew 1, put 1 on bottom → same size as before
                expect(context.player1Object.hand.length).toBe(handSizeBefore);

                // Turn passed to player 2
                expect(context.player2).toBeActivePlayer();
            });

            it('even with an empty hand, Plan draws a card and then prompts for the bottom-of-deck choice', function () {
                const { context } = contextRef;

                // Give player2 the turn by having player1 claim Blast first
                context.player1.clickPrompt('Claim Blast');
                // player2 is now active with an empty hand
                expect(context.player2Object.hand.length).toBe(0);

                context.player2.clickPrompt('Claim Plan');

                // Drew 1 card (death-star-stormtrooper) into hand
                expect(context.player2Object.hand.length).toBe(1);

                // Prompted to put that card on the bottom
                expect(context.player2).toHavePrompt('Choose a card from your hand to put on the bottom of your deck');
                context.player2.clickCard(context.deathStarStormtrooper);

                // Both players have now permanently exited the action phase (player1 claimed Blast,
                // player2 claimed Plan), so the action phase ends immediately. The game moves to
                // the regroup phase, where each player draws 2 cards — so player2 draws
                // death-star-stormtrooper back from the bottom of the deck.
                expect(context.game.currentPhase).toBe('regroup');
            });
        });

        describe('Claim Plan token with an empty deck and cards already in hand', function () {
            it('takes 3 base damage from the empty-deck draw, prompts to put the hand card on the bottom, then ends the action phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: [],
                        deck: ['battlefield-marine'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: ['death-star-stormtrooper'],
                        deck: [],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // player2 now active: empty deck, one card in hand
                expect(context.player2.deck.length).toBe(0);
                expect(context.player2.hand.length).toBe(1);
                expect(context.p2Base.damage).toBe(0);

                context.player2.clickPrompt('Claim Plan');

                // Drawing from an empty deck deals 3 damage to the player's own base
                expect(context.p2Base.damage).toBe(3);

                // The hand card is still there and player is prompted to put it on the bottom
                expect(context.player2).toHavePrompt('Choose a card from your hand to put on the bottom of your deck');
                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('deck');

                context.player1.clickPrompt('Claim Initiative');

                // P2 draws 1 card and takes 3 damage
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.p2Base.damage).toBe(6);
                expect(context.deathStarStormtrooper).toBeInZone('hand');
            });
        });
    });
});
