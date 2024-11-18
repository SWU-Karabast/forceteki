describe('Luke Skywalker, Faithful Friend', function() {
    integration(function(contextRef) {
        describe('Luke\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'cartel-spacer', 'alliance-xwing'],
                        groundArena: ['atst'],
                        leader: 'luke-skywalker#faithful-friend'
                    },
                    player2: {
                        hand: ['alliance-dispatcher'],
                        groundArena: ['specforce-soldier'],
                    }
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

        describe('Luke\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give any unit a shield token on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter, context.wampa, context.tieAdvanced]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);
                expect(context.lukeSkywalker.damage).toBe(4);
                expect(context.wampa.damage).toBe(4);

                // reset for a second attack to confirm that shield gets applied to wampa before the attack damage happens
                context.setDamage(context.lukeSkywalker, 0);
                context.lukeSkywalker.exhausted = false;
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
