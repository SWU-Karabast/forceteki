describe('Play event from hand', function() {
    integration(function(contextRef) {
        describe('When an event is played', function() {
            it('it should end up in discard and resources should be exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.daringRaid).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // play a second event with an aspect penalty
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.wampa);

                expect(context.repair).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('can be cancelled and then triggered successfully', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tactical-advantage'],
                        groundArena: ['pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tacticalAdvantage);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickPrompt('Cancel');
                expect(context.player1).toBeActivePlayer();
                expect(context.tacticalAdvantage).toBeInZone('hand');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player1.clickCard(context.tacticalAdvantage);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.getPower()).toBe(4);
                expect(context.pykeSentinel.getHp()).toBe(5);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.pykeSentinel);
                expect(context.wampa.damage).toBe(4);
                expect(context.pykeSentinel.damage).toBe(4);
                expect(context.pykeSentinel).toBeInZone('groundArena');
                expect(context.getChatLogs(5)).toContain('player1 plays Tactical Advantage to give +2/+2 to Pyke Sentinel for this phase');
                expect(context.getChatLogs(5)).not.toContain('player1 plays Tactical Advantage');
            });
        });

        describe('when the event has no effect', function () {
            it('can cancel playing the event if it has no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['force-choke'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forceChoke);
                expect(context.player1).toHavePrompt('Playing Force Choke will have no effect. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

                context.player1.clickPrompt('Cancel');
                expect(context.forceChoke).toBeInZone('hand');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.forceChoke);
                expect(context.player1).toHavePrompt('Playing Force Choke will have no effect. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

                context.player1.clickPrompt('Play anyway');
                expect(context.forceChoke).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts the user to tell them the event will not change the game state', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['force-choke'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forceChoke);
                expect(context.player1).toHavePrompt('Playing Force Choke will have no effect. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

                context.player1.clickPrompt('Play anyway');
                expect(context.forceChoke).toBeInZone('discard');
                expect(context.getChatLogs(1)).toContain('player1 plays Force Choke');
            });

            it('prompts the user to tell them the event is blank', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['superlaser-blast'],
                    },
                    player2: {
                        spaceArena: ['relentless#konstantines-folly'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.superlaserBlast);
                expect(context.player1).toHavePrompt('Playing Superlaser Blast will have no effect due to an ongoing effect of Relentless. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

                context.player1.clickPrompt('Play anyway');
                expect(context.superlaserBlast).toBeInZone('discard');
                expect(context.getChatLogs(1)).toContain('player1 plays Superlaser Blast to do nothing due to an ongoing effect of Relentless');
            });
        });
    });
});
