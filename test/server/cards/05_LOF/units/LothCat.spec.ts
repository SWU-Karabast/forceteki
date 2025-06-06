describe('Loth-Cat', function() {
    integration(function(contextRef) {
        it('Loth-Cat\'s ability may exhaust a ground unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['loth-cat'],
                    groundArena: ['wampa', 'battlefield-marine']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['specforce-soldier'],
                    spaceArena: ['green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            // when played ability
            context.player1.clickCard(context.lothCat);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.specforceSoldier, context.lothCat]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            // when defeated ability
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.lothCat);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.specforceSoldier]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.specforceSoldier);
            expect(context.player1).toBeActivePlayer();
            expect(context.specforceSoldier.exhausted).toBeTrue();
        });
    });
});