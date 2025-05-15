describe('Maz Kanata, The Light Guides', function() {
    integration(function(contextRef) {
        it('Maz Kanata\'s ability should attack with a force unit and give it +2 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['maz-kanata#the-light-guides'],
                    groundArena: ['wampa', 'nightsister-warrior']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mazKanata);
            expect(context.player1).toBeAbleToSelectExactly([context.nightsisterWarrior]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.nightsisterWarrior);
            context.player1.clickCard(context.sundariPeacekeeper);
            expect(context.sundariPeacekeeper.damage).toBe(4);
            expect(context.nightsisterWarrior.damage).toBe(1);

            // do a second attack to confirm that the +2 bonus has expired
            context.player2.passAction();
            context.readyCard(context.nightsisterWarrior);
            context.setDamage(context.sundariPeacekeeper, 0);
            context.setDamage(context.nightsisterWarrior, 0);

            context.player1.clickCard(context.nightsisterWarrior);
            context.player1.clickCard(context.sundariPeacekeeper);

            expect(context.nightsisterWarrior.damage).toBe(1);
            expect(context.sundariPeacekeeper.damage).toBe(2);
        });
    });
});
