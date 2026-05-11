describe('Twin Suns claim tokens', function () {
    integration(function (contextRef) {
        describe('token buttons in Twin Suns format', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                        hand: [],
                        deck: ['wampa'],
                    }
                });
            });

            it('shows all three claim token buttons at the start of an action phase', function () {
                const { context } = contextRef;
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Claim Initiative', 'Claim Plan', 'Claim Blast']);
            });

            it('Pass is disabled when tokens are still unclaimed', function () {
                const { context } = contextRef;
                expect(context.player1).toHaveDisabledPromptButton('Pass');
            });

            it('Blast button disappears after it is claimed', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Claim Blast');

                // player2 is now active; Blast is already claimed globally so no Blast button
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Initiative', 'Claim Plan']);
                expect(context.player2).toHaveDisabledPromptButton('Pass');
            });

            it('Plan button disappears after it is claimed', function () {
                const { context } = contextRef;

                // Claiming Plan draws a card (battlefield-marine) then prompts to put one on the bottom
                context.player1.clickPrompt('Claim Plan');
                expect(context.player1).toHavePrompt('Choose a card from your hand to put on the bottom of your deck');
                context.player1.clickCard(context.battlefieldMarine);

                // player2 is now active; Plan is already claimed globally so no Plan button
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Initiative', 'Claim Blast']);
                expect(context.player2).toHaveDisabledPromptButton('Pass');
            });

            it('Initiative button disappears and Pass remains disabled after it is claimed', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Claim Initiative');

                // player2 is now active; Initiative is claimed, but Plan and Blast still unclaimed
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Plan', 'Claim Blast']);
                expect(context.player2).toHaveDisabledPromptButton('Pass');
            });

            it('Pass becomes enabled once all three tokens are claimed', function () {
                const { context } = contextRef;

                // In normal play, sequential token-claiming causes the action phase to end when the
                // third token is claimed. We set the tokens directly to test the button logic.
                context.game.isInitiativeClaimed = true;
                context.game.isPlanTokenClaimed = true;
                context.game.isBlastTokenClaimed = true;
                context.game.continue();

                // All tokens claimed: only Pass remains, and it is not disabled
                expect(context.player1).toHaveExactPromptButtons(['Pass']);
                expect(context.player1).not.toHaveDisabledPromptButton('Pass');
            });
        });

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

                // Net hand change: drew 1, discarded 1 → same size as before
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

        describe('Claim Blast token effect', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: [],
                        // Two cards so the regroup drawTwo (draw 2) doesn't trigger empty-deck damage
                        deck: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        // Two cards so the regroup drawTwo (draw 2) doesn't trigger empty-deck damage
                        deck: ['wampa', 'moment-of-peace'],
                    }
                });
            });

            it('deals 1 damage to the opponent\'s base and passes the turn', function () {
                const { context } = contextRef;

                expect(context.p2Base.damage).toBe(0);

                context.player1.clickPrompt('Claim Blast');

                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('player2 claiming Blast deals 1 damage to player1\'s base', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Claim Initiative');
                // player2 is now active
                context.player2.clickPrompt('Claim Blast');

                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);
            });
        });

        describe('token reset between action phases', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: [],
                        deck: ['battlefield-marine', 'moment-of-peace', 'wampa'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        deck: ['death-star-stormtrooper', 'scout-bike-pursuer', 'atst'],
                    }
                });
            });

            it('all three token buttons reappear at the start of the next action phase', function () {
                const { context } = contextRef;

                // Skip through the current action phase (claims all tokens) and regroup
                context.moveToNextActionPhase();

                // All tokens should be reset for the new action phase
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Claim Initiative', 'Claim Plan', 'Claim Blast']);
                expect(context.player1).toHaveDisabledPromptButton('Pass');
            });
        });

        describe('token buttons absent in Premier format', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'kestro-city',
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                    }
                });
            });

            it('only Pass and Claim Initiative are shown in a standard Premier game', function () {
                const { context } = contextRef;
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
            });

            it('Pass is not disabled in Premier (no token restriction)', function () {
                const { context } = contextRef;
                expect(context.player1).not.toHaveDisabledPromptButton('Pass');
            });
        });
    });
});
