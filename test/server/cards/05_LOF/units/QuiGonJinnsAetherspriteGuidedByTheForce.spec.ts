describe('Qui-Gon Jinn\'s Aethersprite, Guided by the Force', () => {
    integration(function (contextRef) {
        const prompt = 'You may use that "When Played" ability again';

        describe('On Attack ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        base: 'chopper-base',
                        hand: [
                            'leia-organa#defiant-princess',
                            'death-space-skirmisher'
                        ],
                        spaceArena: [
                            'quigon-jinns-aethersprite#guided-by-the-force'
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'green-squadron-awing',
                            'phoenix-squadron-awing'
                        ]
                    }
                });
            });

            it('allows you to use a "When Played" ability again', () => {
                const { context } = contextRef;

                // Attack with the Aethersprite to activate the ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Play Leia Organa to trigger her "When Played" ability
                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');

                // Ability is triggered again (but this should be optional)
                expect(context.player1).toHaveExactPromptButtons(['Ready a resource', 'Exhaust a unit']);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1).not.toHavePrompt(prompt);
            });
        });
    });
});