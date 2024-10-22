describe('Agent Kallus, Seeking the Rebels', function() {
    integration(function(contextRef) {
        describe('Kallus\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'agent-kallus#seeking-the-rebels',
                            'battlefield-marine',
                            'dengar#the-demolisher',
                            'leia-organa#defiant-princess',
                            'general-tagge#concerned-commander'
                        ]
                    },
                    player2: {
                        groundArena: ['wampa', 'admiral-ozzel#overconfident']
                    }
                });
            });

            it('should once per turn allow the controller to draw a card when another unique unit is defeated', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.setDamage(context.wampa, 0);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                const round1HandSize = context.player1.handSize;

                // CASE 1: option to draw card when friendly unique unit is defeated (do not take)
                context.player1.clickCard(context.dengar);
                context.player1.clickCard(context.wampa);
                expect(context.dengar).toBeInLocation('discard');
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Pass');
                expect(context.player1.handSize).toBe(round1HandSize);

                reset();

                // CASE 2: non-unique is defeated, no trigger
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.battlefieldMarine).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(round1HandSize);

                reset(false);

                // CASE 3: option to draw card when enemy unique unit is defeated (do take)
                context.player2.clickCard(context.admiralOzzel);
                context.player2.clickCard(context.agentKallus);
                expect(context.admiralOzzel).toBeInLocation('discard');
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Draw a card');
                expect(context.player1.handSize).toBe(round1HandSize + 1);

                reset(false);

                // CASE 4: unique is defeated but ability already used, no trigger
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.wampa);
                expect(context.leiaOrgana).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(round1HandSize + 1);

                reset();
                context.moveToNextActionPhase();
                const round2HandSize = context.player1.handSize;

                // CASE 5: unique is defeated next round, ability can trigger
                context.player1.clickCard(context.generalTagge);
                context.player1.clickCard(context.wampa);
                expect(context.generalTagge).toBeInLocation('discard');
                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Draw a card');
                expect(context.player1.handSize).toBe(round2HandSize + 1);

                reset();
                context.moveToNextActionPhase();
                const round3HandSize = context.player1.handSize;

                // CASE 6: Kallus is defeated, no trigger
                context.player1.clickCard(context.agentKallus);
                context.player1.clickCard(context.wampa);
                expect(context.agentKallus).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(round3HandSize);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
