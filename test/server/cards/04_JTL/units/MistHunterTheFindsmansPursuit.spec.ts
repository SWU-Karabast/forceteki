describe('Mist Hunter The Findsmans Pursuit', function() {
    integration(function(contextRef) {
        it('Mist Hunter The Findsmans Pursuit\'s ability should draw a card on attack, if a Pilor or Bounty hunter has been played this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['boshek#charismatic-smuggler', 'ketsu-onyo#old-friend', 'battlefield-marine'],
                    spaceArena: ['mist-hunter#the-findsmans-pursuit']
                },
                player2: {
                    hand: ['embo#stoic-and-resolute'],
                }
            });

            const { context } = contextRef;

            // Not triggered, due to no card played with correct Trait
            context.player1.clickCard(context.battlefieldMarine);
            context.player2.passAction();
            context.player1.clickCard(context.mistHunter);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.handSize).toBe(2);


            context.moveToNextActionPhase();  // adds two cards to hand

            // Play a Pilot Trait card and trigger draw
            context.player1.clickCard(context.boshek);
            context.player2.passAction();
            context.player1.clickCard(context.mistHunter);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Draw a card');
            expect(context.player1.handSize).toBe(4);


            context.moveToNextActionPhase();  // adds two cards to hand

            // Play a Bounty Hunter Trait card and trigger draw
            context.player1.clickCard(context.ketsuOnyo);
            context.player2.passAction();
            context.player1.clickCard(context.mistHunter);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Draw a card');
            expect(context.player1.handSize).toBe(6);

            context.moveToNextActionPhase();  // adds two cards to hand

            context.player1.passAction();
            context.player2.clickCard(context.embo);

            context.player1.clickCard(context.mistHunter);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.handSize).toBe(8);
        });
    });
});
