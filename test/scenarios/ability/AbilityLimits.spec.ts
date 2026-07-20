describe('Ability limits', function() {
    integration(function(contextRef) {
        // Ruling 2024: a "once per round" (or similar) ability-use limit is attached to the specific
        // copy of the card, not tracked per controlling player. So if a card uses such an ability and
        // then control of the card changes to another player in the same round, the new controller
        // cannot use that ability again this round — the limit already counted for that card copy.
        describe('When a card with a once-per-round ability changes control after using it', function() {
            xit('does not let the new controller use the once-per-round ability again in the same round', function () {
                // A unit with a "use this ability only once each round" ability uses it. An opponent then
                // takes control of that unit in the same round (e.g. Change of Heart). The new controller
                // cannot use the once-per-round ability again this round, because the limit is tracked on
                // the card copy, not per controller.
            });
        });
    });
});
