describe('Wartime Profiteering', function () {
    integration(function (contextRef) {
        describe('Wartime Profiteering\'s ability', function () {
            it('should look at cards from the top of your deck equal to the number of units that were defeated this phase, draw 1 and put the others on the bottom of your deck in a random order', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wartime-profiteering'],
                        groundArena: ['battlefield-marine'],
                        deck: ['atst', 'yoda#old-master', 'bendu#the-one-in-the-middle']
                    },
                    player2: {
                        groundArena: ['wampa', 'specforce-soldier'],
                    }
                });

                const { context } = contextRef;

                // no unit dead, event does nothing
                context.player1.clickCard(context.wartimeProfiteering);
                expect(context.player2).toBeActivePlayer();

                // kill specforce soldier
                context.player2.clickCard(context.specforceSoldier);
                context.player2.clickCard(context.battlefieldMarine);

                // kill battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                context.player1.moveCard(context.wartimeProfiteering, 'hand');
                context.player2.passAction();

                // show 2 cards and select 1
                context.player1.clickCard(context.wartimeProfiteering);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.yoda]);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.yoda);
                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('hand');
                expect(context.atst).toBeInBottomOfDeck(context.player1, 1);

                context.player1.moveCard(context.wartimeProfiteering, 'hand');
                context.moveToNextActionPhase();

                // no unit dead, event does nothing
                context.player1.clickCard(context.wartimeProfiteering);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
