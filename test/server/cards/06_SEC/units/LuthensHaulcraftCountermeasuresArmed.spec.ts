describe('Luthen\'s Haulcraft, Countermeasures Armed', function () {
    integration(function (contextRef) {
        const disclosePrompt = 'Disclose Aggression, Aggression, Heroism to make your opponent discards 2 cards from their hand';

        it('Luthen\'s Haulcraft\'s when defeated ability should disclose Aggression, Aggression, Heroism to discard 2 cards from opponent hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['luthens-haulcraft#countermeasures-armed'],
                    hand: ['karabast', 'bravado'] // Aggression|Heroism and Aggression
                },
                player2: {
                    hand: ['pillage', 'force-throw', 'resupply', 'vanquish'], // will discard 2 after disclose
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Opponent defeats Luthen's Haulcraft to trigger when defeated ability
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.luthensHaulcraftCountermeasuresArmed);
            expect(context.luthensHaulcraftCountermeasuresArmed).toBeInZone('discard', context.player1);

            // Disclose window appears for P1
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveChooseNothingButton();
            // Select Karabast (Aggression|Heroism) and Bravado (Aggression) to satisfy A, A, H
            expect(context.player1).toBeAbleToSelectExactly([context.karabast, context.bravado]);
            context.player1.clickCard(context.karabast);
            context.player1.clickCard(context.bravado);
            context.player1.clickDone();

            // Opponent views disclosed cards
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.karabast, context.bravado]);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickDone();

            // Opponent must choose 2 cards to discard
            expect(context.player2).toBeAbleToSelectExactly([context.pillage, context.forceThrow, context.resupply]);
            context.player2.clickCard(context.pillage);
            context.player2.clickCard(context.resupply);
            context.player2.clickCardNonChecking(context.forceThrow);
            context.player2.clickDone();

            expect(context.pillage).toBeInZone('discard', context.player2);
            expect(context.resupply).toBeInZone('discard', context.player2);
            expect(context.forceThrow).toBeInZone('hand', context.player2);
        });

        it('Luthen\'s Haulcraft\'s when defeated ability should disclose Aggression, Aggression, Heroism to discard 2 cards from opponent hand (max 1 card)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['luthens-haulcraft#countermeasures-armed'],
                    hand: ['karabast', 'bravado'] // Aggression|Heroism and Aggression
                },
                player2: {
                    hand: ['pillage', 'vanquish'], // will discard 2 after disclose
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Opponent defeats Luthen's Haulcraft to trigger when defeated ability
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.luthensHaulcraftCountermeasuresArmed);
            expect(context.luthensHaulcraftCountermeasuresArmed).toBeInZone('discard', context.player1);

            // Disclose window appears for P1
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveChooseNothingButton();
            // Select Karabast (Aggression|Heroism) and Bravado (Aggression) to satisfy A, A, H
            expect(context.player1).toBeAbleToSelectExactly([context.karabast, context.bravado]);
            context.player1.clickCard(context.karabast);
            context.player1.clickCard(context.bravado);
            context.player1.clickDone();

            // Opponent views disclosed cards
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.karabast, context.bravado]);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickDone();

            // Opponent must choose 2 cards to discard but have only one
            context.player2.clickCard(context.pillage);

            expect(context.pillage).toBeInZone('discard', context.player2);
        });
    });
});
