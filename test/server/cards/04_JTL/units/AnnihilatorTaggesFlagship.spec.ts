describe('Annihilator, Tagge\'s Flagship', function() {
    integration(function(contextRef) {
        it('Annihilator should defeat an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['annihilator#tagges-flagship'],
                    spaceArena: ['concord-dawn-interceptors']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.annihilator);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Annihilator should do nothing if there are no enemy units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['annihilator#tagges-flagship'],
                    spaceArena: ['concord-dawn-interceptors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.annihilator);
            expect(context.player2).toBeActivePlayer();
        });

        it('Annihilator should defeat an enemy unit and discard a card with the same name from the opponent\'s hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['annihilator#tagges-flagship'],
                    spaceArena: ['concord-dawn-interceptors']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['wampa']
                }
            });

            const { context } = contextRef;

            const inPlayWampa = context.player2.findCardByName('wampa', 'groundArena');
            const inHandWampa = context.player2.findCardByName('wampa', 'hand');

            context.player1.clickCard(context.annihilator);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([inPlayWampa, context.battlefieldMarine]);
            context.player1.clickCard(inPlayWampa);
            expect(inPlayWampa).toBeInZone('discard');

            // Player sees the opponent's hand
            expect(context.player1).toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveExactViewableDisplayPromptCards([
                inHandWampa
            ]);
            context.player1.clickPrompt('Done');

            expect(inHandWampa).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
