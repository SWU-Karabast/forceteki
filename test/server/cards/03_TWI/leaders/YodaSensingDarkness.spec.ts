describe('Yoda, Sensing Darkness', function () {
    integration(function (contextRef) {
        describe('Yoda\'s leader undeployed ability', function () {
            it('', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        hand: ['wampa', 'krayt-dragon', 'vanquish'],
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 7,
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'liberated-slaves', 'pyke-sentinel']
                    },
                });

                const { context } = contextRef;

                // Defeat unit
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // Yoda Leader ability should activate
                context.player1.clickCard(context.yoda);
                context.player1.clickPrompt('If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.');
                expect(context.player1.handSize).toBe(3);
                expect(context.entrenched).toBeInZone('hand', context.player1);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.kraytDragon, context.entrenched]);
                expect(context.player1).not.toHaveChooseNoTargetButton(); // TODO - fix this

                // Select Card, Then Choose Top
                context.player1.clickCard(context.entrenched);
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player1.clickPrompt('Top');

                context.player2.passAction();

                // Yoda Leader ability should do nothing
                context.player1.clickCard(context.yoda);

                // Deploy Yoda
            });
        });
    });
});
