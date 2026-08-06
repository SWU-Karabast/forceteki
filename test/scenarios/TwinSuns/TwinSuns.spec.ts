describe('Twin Suns format', function () {
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
                context.game.isPlanCounterClaimed = true;
                context.game.isBlastCounterClaimed = true;
                context.game.continue();

                // All tokens claimed: only Pass remains, and it is not disabled
                expect(context.player1).toHaveExactPromptButtons(['Pass']);
                expect(context.player1).not.toHaveDisabledPromptButton('Pass');
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
