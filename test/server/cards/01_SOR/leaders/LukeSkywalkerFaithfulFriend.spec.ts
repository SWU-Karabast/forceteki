describe('Luke Skywalker, Faithful Friend', function() {
    integration(function(contextRef) {
        describe('Luke\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'cartel-spacer', 'alliance-xwing'],
                        groundArena: ['atst'],
                        leader: 'luke-skywalker#faithful-friend'
                    },
                    player2: {
                        hand: ['alliance-dispatcher'],
                        groundArena: ['specforce-soldier'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give a friendly heroism unit played by us this turn a shield token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.allianceDispatcher);

                context.player1.clickCard(context.cartelSpacer);

                context.player2.passAction();

                const resourcesSpentBeforeLukeActivation = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.lukeSkywalker.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(resourcesSpentBeforeLukeActivation + 1);
            });

            it('should not be able to give a shield to a unit played in the previous phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                const resourcesSpentBeforeLukeActivation = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(context.allianceXwing).toHaveExactUpgradeNames(['shield']);
                expect(context.lukeSkywalker.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(resourcesSpentBeforeLukeActivation + 1);
            });
        });

        describe('Luke\'s undeployed ability with a pilot that became a unit', function() {
            // Ruling 2025-04-30: "heroic unit played this round" is read holistically — the card must
            // have been played as a unit. A pilot played as an upgrade that later becomes a unit (e.g.
            // its vehicle is defeated) does not qualify for the Shield.
            // NOTE: currently fails — the engine still treats the pilot-moved Luke as a "unit played
            // this phase" and allows selecting him. Left as xit pending implementation of the ruling.
            xit('should not be able to give a shield to a pilot played as an upgrade this phase that became a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['luke-skywalker#you-still-with-me', 'battlefield-marine'],
                        groundArena: ['snowspeeder'],
                        resources: 10
                    },
                    player2: {
                        hand: ['confiscate'],
                        resources: 10
                    }
                });

                const { context } = contextRef;
                const lukeLeader = context.player1.findCardByName('luke-skywalker#faithful-friend');
                const lukePilot = context.player1.findCardByName('luke-skywalker#you-still-with-me');

                // Player 1 plays Battlefield Marine as a unit this phase (a valid future Shield target)
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // Player 1 plays JTL Luke as a pilot upgrade on the Snowspeeder this phase
                context.player1.clickCard(lukePilot);
                context.player1.clickPrompt('Play Luke Skywalker with Piloting');
                context.player1.clickCard(context.snowspeeder);

                // Player 2 defeats the pilot upgrade; Player 1 moves Luke to the ground arena instead
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(lukePilot);
                context.player1.clickPrompt('Trigger');
                expect(lukePilot).toBeInZone('groundArena');

                // Luke leader's ability can only target the Battlefield Marine (played as a unit), not
                // the pilot-moved Luke (played as an upgrade)
                context.player1.clickCard(lukeLeader);
                context.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            });
        });

        describe('Luke\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give any unit a shield token on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Give a shield token to another unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter, context.wampa, context.tieAdvanced]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);
                expect(context.lukeSkywalker.damage).toBe(4);
                expect(context.wampa.damage).toBe(4);

                // reset for a second attack to confirm that shield gets applied to wampa before the attack damage happens
                context.setDamage(context.lukeSkywalker, 0);
                context.readyCard(context.lukeSkywalker);
                context.setDamage(context.wampa, 0);
                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.wampa);

                expect(context.lukeSkywalker.damage).toBe(4);
                expect(context.wampa.damage).toBe(0);
                expect(context.wampa.isUpgraded()).toBe(false);
            });
        });
    });
});
