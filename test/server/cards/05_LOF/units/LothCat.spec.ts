describe('Loth-Cat', function() {
    integration(function(contextRef) {
        it('Loth-Cat\'s ability may exhaust a ground unit when played and when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lothcat'],
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
            context.player1.clickCard(context.lothcat);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.specforceSoldier, context.lothcat]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            // when defeated ability
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.lothcat);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.specforceSoldier]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.specforceSoldier);
            expect(context.player1).toBeActivePlayer();
            expect(context.specforceSoldier.exhausted).toBeTrue();
        });

        it('Loth-Cat\'s ability may exhaust a ground unit when defeated with No Glory Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['lothcat', 'wampa', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['specforce-soldier'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // when defeated ability
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.lothcat);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.specforceSoldier]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wampa);
            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeTrue();
        });
    });
});