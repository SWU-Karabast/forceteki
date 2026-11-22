describe('Mysterious Disappearance', function () {
    integration(function (contextRef) {
        describe('Mysterious Disappearance\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mysterious-disappearance'],
                        groundArena: ['battlefield-marine'],
                        leader: 'luke-skywalker#faithful-friend'
                    },
                    player2: {
                        groundArena: ['wampa', 'sundari-peacekeeper'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should let the opponent choose a unit, defeat it, and give them a Beast token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mysteriousDisappearance);

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Cancel']);
                context.player1.clickPrompt('Opponent');

                // The opponent chooses from their own non-leader units - the deployed leader is not eligible.
                expect(context.player2).toHavePrompt('Choose a non-leader unit. Your opponent may defeat it.');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.sundariPeacekeeper]);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Defeat Wampa');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa).toBeInZone('discard', context.player2);

                const beast = context.player2.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player2);
                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the player choose themselves and create the Beast token for them', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mysteriousDisappearance);
                context.player1.clickPrompt('You');

                expect(context.player1).toHavePrompt('Choose a non-leader unit. You may defeat it.');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Defeat Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(() => context.player2.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not defeat the unit or create a Beast token if the player declines', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mysteriousDisappearance);
                context.player1.clickPrompt('Opponent');
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Defeat Wampa');
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(() => context.player2.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Mysterious Disappearance should do nothing further if the chosen player has no non-leader units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mysterious-disappearance'],
                },
                player2: {
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mysteriousDisappearance);
            context.player1.clickPrompt('Opponent');

            // Only a deployed leader in play, which is not a legal choice, so the event ends.
            expect(context.mysteriousDisappearance).toBeInZone('discard', context.player1);
            expect(() => context.player2.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
