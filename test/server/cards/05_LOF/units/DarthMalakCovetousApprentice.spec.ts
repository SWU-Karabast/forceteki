describe('Darth Malak, Covetous Apprentice', function() {
    integration(function(contextRef) {
        it('Darth Malak\'s ability should allow readying the unit when a Sith leader unit is controlled', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-malak#covetous-apprentice'],
                    leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                },
                player2: {
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            // Play Darth Malak
            context.player1.clickCard(context.darthMalak);
            expect(context.player1).toHavePassAbilityPrompt('If you control a Sith leader unit, you may ready this unit.');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.darthMalak.exhausted).toBe(false);
        });

        it('Darth Malak\'s ability should not trigger the ability when no Sith leader unit is controlled', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-malak#covetous-apprentice'],
                    groundArena: ['sith-legionnaire'] // Not a leader unit
                },
                player2: {
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            // Play Darth Malak
            context.player1.clickCard(context.darthMalak);

            expect(context.player2).toBeActivePlayer();
            expect(context.darthMalak.exhausted).toBe(true);
        });
    });
});