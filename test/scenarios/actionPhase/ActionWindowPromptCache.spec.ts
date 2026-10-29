describe('Action window prompt refresh', function() {
    integration(function(contextRef) {
        describe('with ordinary attacks and a playable card', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#alliance-general',
                        base: 'echo-base',
                        resources: 3,
                        hand: ['battlefield-marine'],
                        groundArena: ['wampa']
                    }
                });
            });

            it('should check each card once when setting the prompt and its highlights', function() {
                const { context } = contextRef;
                const actions = jasmine.isSpy(context.wampa.getActions) ? context.wampa.getActions : spyOn(context.wampa, 'getActions').and.callThrough();
                actions.calls.reset();

                context.game.currentActionWindow.setPrompt();

                expect(actions).toHaveBeenCalledTimes(1);
                expect(context.player1).toBeAbleToSelect(context.wampa);
                expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
                expect(context.player1).toHavePrompt('Choose an action');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHaveClaimInitiativeAbilityButton();
            });

            it('should not scan the cards a second time after continue has set the prompt', function() {
                const { context } = contextRef;
                const actionWindow = context.game.currentActionWindow;
                const actions = jasmine.isSpy(context.wampa.getActions) ? context.wampa.getActions : spyOn(context.wampa, 'getActions').and.callThrough();
                actions.calls.reset();

                expect(actionWindow.continue()).toBeFalse();

                expect(actions).toHaveBeenCalledTimes(1);
                expect(context.game.currentActionWindow).toBe(actionWindow);
                expect(context.player1).toBeAbleToSelect(context.wampa);
            });

            it('should refresh legal attacks and card plays after units and resources become exhausted or ready', function() {
                const { context } = contextRef;
                const actionWindow = context.game.currentActionWindow;

                actionWindow.setPrompt();
                expect(context.player1).toBeAbleToSelect(context.wampa);
                expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);

                context.wampa.exhausted = true;
                context.player1.exhaustResources(3);
                actionWindow.setPrompt();

                expect(context.player1).not.toBeAbleToSelect(context.wampa);
                expect(context.player1).not.toBeAbleToSelect(context.battlefieldMarine);

                context.wampa.exhausted = false;
                context.player1.readyResources(3);
                actionWindow.setPrompt();

                expect(context.player1).toBeAbleToSelect(context.wampa);
                expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
            });

            it('should recompute legality for direct prompt reads outside a refresh', function() {
                const { context } = contextRef;
                const actionWindow = context.game.currentActionWindow;
                const actions = jasmine.isSpy(context.wampa.getActions) ? context.wampa.getActions : spyOn(context.wampa, 'getActions').and.callThrough();

                actionWindow.setPrompt();
                actions.calls.reset();

                actionWindow.activePromptInternal(context.player1Object);
                context.wampa.exhausted = true;
                actionWindow.activePromptInternal(context.player1Object);

                expect(actions).toHaveBeenCalledTimes(2);
            });

            it('should recheck a clicked card even when the displayed prompt still highlights it', function() {
                const { context } = contextRef;
                const actionWindow = context.game.currentActionWindow;

                actionWindow.setPrompt();
                expect(context.player1).toBeAbleToSelect(context.wampa);

                context.wampa.exhausted = true;

                expect(actionWindow.onCardClicked(context.player1Object, context.wampa)).toBeFalse();
                expect(context.player1).toHavePrompt('Choose an action');

                actionWindow.setPrompt();
                expect(context.player1).not.toBeAbleToSelect(context.wampa);
            });

            it('should discard the refresh result when setting a player prompt throws', function() {
                const { context } = contextRef;
                const actionWindow = context.game.currentActionWindow;
                const actions = jasmine.isSpy(context.wampa.getActions) ? context.wampa.getActions : spyOn(context.wampa, 'getActions').and.callThrough();
                const setPrompt = jasmine.isSpy(context.player1Object.setPrompt) ? context.player1Object.setPrompt : spyOn(context.player1Object, 'setPrompt');
                setPrompt.and.throwError('prompt update failed');

                expect(() => actionWindow.setPrompt()).toThrowError('prompt update failed');

                setPrompt.and.callThrough();
                context.wampa.exhausted = true;
                actions.calls.reset();
                actionWindow.activePromptInternal(context.player1Object);

                expect(actions).toHaveBeenCalledTimes(1);

                actionWindow.setPrompt();
                expect(context.player1).not.toBeAbleToSelect(context.wampa);
                expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
            });
        });

        it('should keep mandatory attack highlights, title and disabled buttons consistent, then refresh when the attack becomes illegal', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['give-in-to-your-anger'],
                    groundArena: ['scout-bike-pursuer']
                },
                player2: {
                    groundArena: ['wampa', 'atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.giveInToYourAnger);
            context.player1.clickCard(context.wampa);

            const actionWindow = context.game.currentActionWindow;
            const actions = jasmine.isSpy(context.wampa.getActions) ? context.wampa.getActions : spyOn(context.wampa, 'getActions').and.callThrough();
            actions.calls.reset();
            actionWindow.setPrompt();

            expect(actions).toHaveBeenCalledTimes(1);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player2).toHavePrompt('You must attack with Wampa because of Give In to Your Anger');
            expect(context.player2).not.toHavePassAbilityButton();
            expect(context.player2).not.toHaveClaimInitiativeAbilityButton();

            context.wampa.exhausted = true;
            const directPrompt = actionWindow.activePromptInternal(context.player2Object);

            expect(directPrompt.menuTitle).toBe('Choose an action');
            expect(directPrompt.buttons.find((button) => button.arg === 'pass').disabled).toBeFalse();
            expect(directPrompt.buttons.find((button) => button.arg === 'claimInitiative').disabled).toBeFalse();

            actionWindow.setPrompt();

            expect(context.player2).not.toBeAbleToSelect(context.wampa);
            expect(context.player2).toBeAbleToSelect(context.atst);
            expect(context.player2).toHavePrompt('Choose an action');
            expect(context.player2).toHavePassAbilityButton();
            expect(context.player2).toHaveClaimInitiativeAbilityButton();
        });
    });

    undoIntegration(function(contextRef) {
        it('should restore legal actions after rolling back an exhausted position', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    resources: 3,
                    hand: ['battlefield-marine'],
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

            expect(snapshotId).not.toBe(-1);

            context.wampa.exhausted = true;
            context.player1.exhaustResources(3);
            context.game.currentActionWindow.setPrompt();

            expect(context.player1).not.toBeAbleToSelect(context.wampa);
            expect(context.player1).not.toBeAbleToSelect(context.battlefieldMarine);

            expect(contextRef.snapshot.rollbackToSnapshot({
                type: 'manual',
                playerId: context.player1Object.id,
                snapshotId
            })).toBeTrue();

            context.game.currentActionWindow.setPrompt();

            expect(context.wampa.exhausted).toBeFalse();
            expect(context.player1.readyResourceCount).toBe(3);
            expect(context.player1).toBeAbleToSelect(context.wampa);
            expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
            expect(context.player1).toHavePrompt('Choose an action');
        });
    });
});
