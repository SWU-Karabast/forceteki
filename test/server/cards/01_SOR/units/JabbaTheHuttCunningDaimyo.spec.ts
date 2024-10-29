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
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should search the top 8 of the deck for a trick event when played and reduced the cost of tricks events by 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);

                // select a trick event on the top 8 cards
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveDisabledPromptButtons([context.battlefieldMarine.title, context.echoBaseDefender.title, context.cantinaBraggart.title, context.ardentSympathizer.title, context.pykeSentinel.title]);
                expect(context.player1).toHaveEnabledPromptButtons([context.waylay.title, context.shootFirst.title, context.asteroidSanctuary.title, 'Take nothing']);

                context.player1.clickPrompt(context.waylay.title);
                expect(context.waylay).toBeInLocation('hand');

                context.player2.passAction();
                const lastExhaustedResources = context.player1.countExhaustedResources();

                // play waylay with 1 resource less
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1.countExhaustedResources()).toBe(lastExhaustedResources + 2);
            });
        });
    });
});
