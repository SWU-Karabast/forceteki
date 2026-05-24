describe('Luke\'s Jedi Lightsaber, Constructed by Hand', function() {
    integration(function(contextRef) {
        it('Luke\'s Lightsaber\'s ability should give Sentinel to Luke Skywalker', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lukes-jedi-lightsaber#constructed-by-hand', 'rebel-assault'],
                    groundArena: ['luke-skywalker#you-still-with-me', 'wampa'],
                    spaceArena: ['awing'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukesJediLightsaber);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.wampa]);

            context.player1.clickCard(context.lukeSkywalker);

            expect(context.lukeSkywalker.hasSomeKeyword('sentinel')).toBeTrue();
        });

        it('Luke\'s Lightsaber\'s ability should not give Sentinel to units that are not Luke Skywalker', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lukes-jedi-lightsaber#constructed-by-hand', 'rebel-assault'],
                    groundArena: ['luke-skywalker#you-still-with-me', 'wampa'],
                    spaceArena: ['awing'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukesJediLightsaber);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.wampa]);

            context.player1.clickCard(context.wampa);

            expect(context.lukeSkywalker.hasSomeKeyword('sentinel')).toBeFalse();
            expect(context.wampa.hasSomeKeyword('sentinel')).toBeFalse();
        });
    });
});