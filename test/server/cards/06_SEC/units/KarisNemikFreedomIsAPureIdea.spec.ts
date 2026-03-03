describe('Karis Nemik, Freedom Is A Pure Idea', function() {
    integration(function(contextRef) {
        it('Karis Nemik\'s when defeated ability should disclose Aggression and Heroism to create a Spy token and ready it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wrecker#boom'],
                    groundArena: ['karis-nemik#freedom-is-a-pure-idea'],
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.karisNemik);

            expect(context.player1).toHavePrompt('Disclose Aggression, Heroism to create a Spy token and ready it');
            expect(context.player1).toBeAbleToSelectExactly([context.wrecker]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wrecker);

            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wrecker]);
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeFalse();
        });

        it('Karis Nemik\'s when defeated ability should disclose Aggression and Heroism to create a Spy token and ready it (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['karis-nemik#freedom-is-a-pure-idea'],
                },
                player2: {
                    hand: ['no-glory-only-results', 'wrecker#boom'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.karisNemik);

            expect(context.player2).toBeAbleToSelectExactly([context.wrecker]);
            expect(context.player2).toHaveChooseNothingButton();
            context.player2.clickCard(context.wrecker);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wrecker]);
            context.player1.clickDone();

            expect(context.player1).toBeActivePlayer();

            const spies = context.player2.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeFalse();
        });
    });
});