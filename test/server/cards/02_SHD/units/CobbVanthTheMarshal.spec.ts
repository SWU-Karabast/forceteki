describe('Cobb Vanth, The Marshal', function() {
    integration(function(contextRef) {
        describe('Cobb Vanth, The Marshal\'s ability', function() {
            it('should search the deck for a card and make it playable for free for the phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['cobb-vanth#the-marshal'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'patrolling-vwing', 'devotion',
                            'consular-security-force', 'echo-base-defender', 'swoop-racer', 'resupply', 'superlaser-technician'],
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft'],
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.cobbVanth);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.sabineWren, context.battlefieldMarine, context.patrollingVwing],
                    unselectable: [context.waylay, context.protector, context.devotion, context.consularSecurityForce, context.echoBaseDefender, context.swoopRacer, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.patrollingVwing);
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.patrollingVwing).toBeInZone('discard');

                context.player1.passAction();

                // Lets make sure the 2nd player can't take control and play this discarded card
                expect(context.patrollingVwing).not.toHaveAvailableActionWhenClickedBy(context.player2);

                // perform an action so we don't double pass
                context.player2.clickCard(context.systemPatrolCraft);
                context.player2.clickCard(context.p1Base);
                context.systemPatrolCraft.exhausted = false;

                // Lets exhaust 100% of the resources to ensure it can still be played free of cost (ignoring aspect penalties too)
                context.player1.exhaustResources(20);
                context.player1.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(20);

                // Have player 2 remove the patrolling Vwing to make sure the abilities don't persist after being played
                context.player2.clickCard(context.systemPatrolCraft);
                context.player2.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing).toBeInZone('discard');

                // Card should no longer have effect to play from discard
                expect(context.patrollingVwing).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // Double checking by Readying some resources to make sure its not the freeCost / issue
                context.player1.readyResources(4);
                expect(context.patrollingVwing).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('shouldn\'t allow the discarded card to be playable/be free after the phase ends', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['cobb-vanth#the-marshal'],
                        deck: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.cobbVanth);
                expect(context.player1).toHaveExactDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('shouldn\'t allow the discarded card to move to deck and hand and keep its effects', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['restock', 'strategic-analysis'],
                        groundArena: ['cobb-vanth#the-marshal'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['pillage'],
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.cobbVanth);
                expect(context.player1).toHaveExactDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.clickCard(context.restock);
                expect(context.player1).toBeAbleToSelectExactly([context.restock, context.cobbVanth, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Should not be able to click this card from within the deck and have an action
                expect(context.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player2.passAction();

                context.player1.clickCard(context.strategicAnalysis);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.exhaustedResourceCount).toBe(6);

                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Now that this card has gained the effects in the discard, but passed from deck to hand to discard again
                // it should no longer have these effects available to it
                expect(context.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should allow another play from discard event to operate on the selected card without creating play action dupes', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['palpatines-return'],
                        groundArena: ['cobb-vanth#the-marshal'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.cobbVanth);
                expect(context.player1).toHaveExactDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.clickCard(context.palpatinesReturn);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.player1).toBeAbleToSelectExactly([context.cobbVanth, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(8); // should still be free and no net change
                expect(context.battlefieldMarine).toBeInZone('groundArena');
            });
        });
    });
});
