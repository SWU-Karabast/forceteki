describe('Tobias Beckett, I Trust No One', function () {
    integration(function (contextRef) {
        describe('Tobias Beckett\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'battlefield-marine', 'entrenched', 'vanquish', 'rivals-fall'],
                        groundArena: ['tobias-beckett#i-trust-no-one'],
                        resources: 20
                    },
                    player2: {
                        hand: ['cantina-braggart', 'tactical-advantage'],
                        groundArena: ['wampa', 'jedha-agitator', 'death-star-stormtrooper'],
                    }
                });
            });

            it('should exhaust a unit that costs the same as or less than the card you played when you play a non-unit card', function () {
                const { context } = contextRef;

                // play a unit card, nothing happen
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.cantinaBraggart);
                // play an event, should be able to select units with 1-cost or less or pass
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.deathStarStormtrooper]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass ability');

                // enemy play an event card, nothing happen
                context.player2.clickCard(context.tacticalAdvantage);
                context.player2.clickCard(context.cantinaBraggart);

                // play an upgrade card, should be able to select units with 2-costs or less or pass
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.tobiasBeckett);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cantinaBraggart, context.jedhaAgitator, context.deathStarStormtrooper]);
                expect(context.player1).toHavePassAbilityButton();

                // exhaust stormtrooper
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.jedhaAgitator.exhausted).toBeFalse();
                expect(context.tobiasBeckett.exhausted).toBeFalse();

                // play a new event, ability limit is reached, nothing happen
                context.player2.passAction();
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // ability limit should reset on next action phase
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.player1).toBeAbleToSelectExactly([context.tobiasBeckett, context.wampa, context.battlefieldMarine, context.cantinaBraggart]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.tobiasBeckett.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cantinaBraggart.exhausted).toBeFalse();
            });
        });
    });
});
