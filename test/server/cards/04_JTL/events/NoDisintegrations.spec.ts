describe('No Disintegrations', function() {
    integration(function(contextRef) {
        it('No Disintegrations\'s ability should deal damage to a non leader unit equal to its remaining hp minus 1', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['no-disintegrations'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 3 }, { card: 'battlefield-marine', upgrades: ['experience'] }],
                    spaceArena: ['green-squadron-awing'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noDisintegrations);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst, context.greenSquadronAwing]);
            context.player1.clickCard(context.atst);
            expect(context.atst.damage).toBe(6);

            context.player1.moveCard(context.noDisintegrations, 'hand');
            context.player2.passAction();

            context.player1.clickCard(context.noDisintegrations);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(4);

            context.player2.passAction();
            context.player1.moveCard(context.noDisintegrations, 'hand');

            context.player1.clickCard(context.noDisintegrations);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.damage).toBe(3);

            context.player2.passAction();
            context.player1.moveCard(context.noDisintegrations, 'hand');
            context.player1.clickCard(context.noDisintegrations);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(4);
        });
    });
});
