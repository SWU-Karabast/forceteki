describe('Masterstroke', function() {
    integration(function(contextRef) {
        it('Masterstroke\'s ability should give a unit +1/+0 for each unit the defending player controls in its arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['masterstroke'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }, 'death-star-stormtrooper', 'guavian-antagonizer'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.masterstroke);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(7);
            expect(context.battlefieldMarine.getPower()).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });
    });
});