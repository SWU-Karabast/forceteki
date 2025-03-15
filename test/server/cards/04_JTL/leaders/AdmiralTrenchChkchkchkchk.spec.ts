describe('Admiral Trench, Chk-chk-chk-chk', function() {
    integration(function(contextRef) {
        describe('Admiral Trench\'s undeployed ability', function() {
            it('should make you discard a card that costs 3 or more and draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        hand: ['wampa', 'cartel-spacer', 'endless-legions', 'the-darksaber'],
                        deck: ['atst', 'low-altitude-gunship'],
                    },
                    player2: {
                        hand: ['waylay'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Discard a card that costs 3 or more from your hand');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.endlessLegions, context.theDarksaber]);

                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.atst).toBeInZone('hand');
                expect(context.lowAltitudeGunship).toBeInZone('deck');
            });

            it('can be used without discarding anything with no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        hand: ['wampa', 'cartel-spacer', 'endless-legions', 'the-darksaber'],
                        deck: ['atst', 'low-altitude-gunship'],
                    },
                    player2: {
                        hand: ['waylay'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Discard a card that costs 3 or more from your hand');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.endlessLegions, context.theDarksaber]);

                context.player1.clickPrompt('Choose no target');

                expect(context.wampa).toBeInZone('hand');
                expect(context.atst).toBeInZone('deck');
                expect(context.lowAltitudeGunship).toBeInZone('deck');
            });
        });

        describe('Admiral Trench\'s deployed ability', function() {
            it('reveals the top 4 cards of your deck, an opponent discards 2 of them, and you dray 1 of the remaining cards and discard the other', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        deck: ['wampa', 'cartel-spacer', 'endless-legions', 'the-darksaber', 'evacuate'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                expect(context.getChatLogs(1)[0]).toContain(context.cartelSpacer.title);
                expect(context.getChatLogs(1)[0]).toContain(context.endlessLegions.title);
                expect(context.getChatLogs(1)[0]).toContain(context.theDarksaber.title);

                context.player1.clickPrompt('Done');

                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.cartelSpacer, context.endlessLegions, context.theDarksaber]
                });
                expect(context.player2).toHaveDisabledPromptButton('Done');

                context.player2.clickCardInDisplayCardPrompt(context.endlessLegions);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selected: [context.endlessLegions],
                    selectable: [context.wampa, context.cartelSpacer, context.theDarksaber]
                });
                expect(context.player2).toHaveDisabledPromptButton('Done');
                context.player2.clickCardInDisplayCardPrompt(context.theDarksaber);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selected: [context.endlessLegions, context.theDarksaber],
                    selectable: [context.wampa, context.cartelSpacer]
                });
                expect(context.player2).toHaveEnabledPromptButton('Done');

                // unselect and select another
                context.player2.clickCardInDisplayCardPrompt(context.theDarksaber);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selected: [context.endlessLegions],
                    selectable: [context.wampa, context.cartelSpacer, context.theDarksaber]
                });
                expect(context.player2).toHaveDisabledPromptButton('Done');
                context.player2.clickCardInDisplayCardPrompt(context.wampa);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selected: [context.endlessLegions, context.wampa],
                    selectable: [context.theDarksaber, context.cartelSpacer]
                });
                context.player2.clickPrompt('Done');

                expect(context.endlessLegions).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.deck).toEqual([
                    context.cartelSpacer,
                    context.theDarksaber,
                    context.evacuate,
                ]);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.cartelSpacer, context.theDarksaber]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.theDarksaber);

                expect(context.endlessLegions).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.theDarksaber).toBeInZone('hand');
                expect(context.player1.deck).toEqual([
                    context.evacuate,
                ]);
            });

            it('works when the deck has 3 cards and it does not discard the last card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        deck: ['wampa', 'cartel-spacer', 'endless-legions'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                expect(context.getChatLogs(1)[0]).toContain(context.cartelSpacer.title);
                expect(context.getChatLogs(1)[0]).toContain(context.endlessLegions.title);

                context.player1.clickPrompt('Done');

                expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.wampa, context.cartelSpacer, context.endlessLegions]);

                context.player2.clickCardInDisplayCardPrompt(context.endlessLegions);
                context.player2.clickCardInDisplayCardPrompt(context.wampa);
                context.player2.clickPrompt('Done');

                expect(context.endlessLegions).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('hand');
                expect(context.player1.deck).toEqual([]);
            });

            it('works when the deck has 2 cards and the player does not draw anything', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        deck: ['wampa', 'cartel-spacer'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                expect(context.getChatLogs(1)[0]).toContain(context.cartelSpacer.title);

                context.player1.clickPrompt('Done');

                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.deck).toEqual([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('works when the deck has 1 card and the player does not draw anything', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        deck: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);

                context.player1.clickPrompt('Done');

                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.deck).toEqual([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used with no limits by paying the cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-trench#chkchkchkchk',
                        deck: [],
                    },
                    player2: {
                        hand: ['rivals-fall'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.exhaustedResourceCount).toBe(0);

                // Deploy Admiral Trench
                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.admiralTrench).toBeInZone('groundArena');
                expect(context.admiralTrench.exhausted).toBeFalse();

                // When Admiral Trench is defeated should go back exhausted and it won't be able to deploy again
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.admiralTrench);

                expect(context.admiralTrench).toBeInZone('base');
                expect(context.admiralTrench.exhausted).toBeTrue();

                context.player1.clickCardNonChecking(context.admiralTrench);

                // Move to the next action phase
                context.moveToNextActionPhase();

                // Deploy Admiral Trench again
                context.player1.clickCard(context.admiralTrench);
                context.player1.clickPrompt('Deploy Admiral Trench');

                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.admiralTrench).toBeInZone('groundArena');
                expect(context.admiralTrench.exhausted).toBeFalse();
            });
        });

        it('cannnot deploy if exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'admiral-trench#chkchkchkchk', exhausted: true },
                    resources: 10,
                },
            });

            const { context } = contextRef;

            context.player1.clickCardNonChecking(context.admiralTrench);

            expect(context.player1).not.toBeAbleToSelect(context.admiralTrench);
        });

        it('cannnot deploy if the resource cost cannot be paid', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'admiral-trench#chkchkchkchk',
                    resources: 10,
                },
            });

            const { context } = contextRef;

            expect(context.player1).toBeAbleToSelect(context.admiralTrench);

            context.player1.clickCard(context.admiralTrench);

            expect(context.player1).toHaveEnabledPromptButtons(['Discard a card that costs 3 or more from your hand', 'Deploy Admiral Trench']);

            context.player1.clickPrompt('Cancel');
            context.player1.exhaustResources(context.player1.readyResourceCount - 2);
            context.player1.clickCard(context.admiralTrench);

            expect(context.admiralTrench.exhausted).toBeTrue();
            expect(context.admiralTrench).toBeInZone('base');
        });
    });
});