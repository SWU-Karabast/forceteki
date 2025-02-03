describe('Republic Tactical Officer', function() {
    integration(function(contextRef) {
        it('Republic Tactical Officer\'s ability should attack with a republic unit and give it +2 power', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['republic-tactical-officer'],
                    groundArena: ['wampa', 'admiral-yularen#advising-caution']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                    spaceArena: ['cartel-spacer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.republicTacticalOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.admiralYularen]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.admiralYularen);
            context.player1.clickCard(context.sundariPeacekeeper);
            expect(context.sundariPeacekeeper.damage).toBe(4);
            expect(context.admiralYularen.damage).toBe(1);

            // do a second attack to confirm that the +2 bonus has expired
            context.player2.passAction();
            context.admiralYularen.exhausted = false;
            context.setDamage(context.sundariPeacekeeper, 0);
            context.setDamage(context.admiralYularen, 0);

            context.player1.clickCard(context.admiralYularen);
            context.player1.clickCard(context.sundariPeacekeeper);

            expect(context.admiralYularen.damage).toBe(1);
            expect(context.sundariPeacekeeper.damage).toBe(2);
        });
    });
});
