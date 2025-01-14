describe('Heavy Persuader Tank', function() {
    integration(function(contextRef) {
        describe('Heavy Persuader Tank\'s ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['heavy-persuader-tank'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['bright-hope#the-last-transport'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['ruthless-raider'],
                    },
                });
            });

            it('should optionally deal 2 damage to any ground unit when played', function() {
                const { context } = contextRef;

                // Play the card
                context.player1.clickCard(context.heavyPersuaderTank);
                context.player1.clickPrompt('Play Heavy Persuader Tank');

                // See if the ability is available
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.heavyPersuaderTank,
                    context.atst
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Use the ability
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);
            });
        });
    });
});
