describe('Jabba the Hutt, Cunning Daimyo', function () {
    integration(function (contextRef) {
        describe('Jabba the Hutt\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jabba-the-hutt#cunning-daimyo'],
                        deck: ['waylay', 'battlefield-marine', 'echo-base-defender', 'cantina-braggart', 'ardent-sympathizer', 'shoot-first', 'asteroid-sanctuary', 'pyke-sentinel', 'cell-block-guard'],
                        leader: 'doctor-aphra#rapacious-archaeologist'
                    },
                    player2: {
                        hand: ['shoot-first'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should search the top 8 of the deck for a trick event when played and reduced the cost of tricks events by 1', function () {
                const { context } = contextRef;

                const p1ShootFirst = context.player1.findCardByName('shoot-first');
                const p2ShootFirst = context.player2.findCardByName('shoot-first');
                context.player1.clickCard(context.jabbaTheHutt);

                // select a trick event on the top 8 cards
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    unselectable: [context.battlefieldMarine, context.echoBaseDefender, context.cantinaBraggart, context.ardentSympathizer, context.pykeSentinel],
                    selectable: [context.waylay, p1ShootFirst, context.asteroidSanctuary]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.waylay);
                expect(context.waylay).toBeInZone('hand');

                context.player2.passAction();
                const lastExhaustedResources = context.player1.exhaustedResourceCount;

                // play waylay with 1 resource less
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1.exhaustedResourceCount).toBe(lastExhaustedResources + 2);

                context.player2.clickCard(p2ShootFirst);
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });
        });
    });
});
