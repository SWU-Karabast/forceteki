describe('Swoop Down', function () {
    integration(function (contextRef) {
        it('Swoop Down\'s ability should initiate an attack with space unit, add saboteur and +2/+0 because if target is on ground arena and give -2/-0 to target if he is on ground arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['swoop-down'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['alliance-xwing']
                },
                player2: {
                    groundArena: ['echo-base-defender', 'consular-security-force'],
                    spaceArena: ['corellian-freighter', 'green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.swoopDown);
            // attack with a space unit
            expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing]);
            context.player1.clickCard(context.allianceXwing);

            // saboteur: we ignore sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.consularSecurityForce, context.corellianFreighter, context.greenSquadronAwing, context.p2Base]);
            context.player1.clickCard(context.greenSquadronAwing);

            // we do not have +2/+0 and do not give -2/-0 to target because he's not on ground arena
            expect(context.player2).toBeActivePlayer();
            expect(context.allianceXwing.damage).toBe(1);
            expect(context.greenSquadronAwing.damage).toBe(2);

            // reset
            context.setDamage(context.allianceXwing, 0);
            context.allianceXwing.exhausted = false;
            context.player1.moveCard(context.swoopDown, 'hand');

            context.player2.passAction();

            // attack a ground unit with a space unit
            context.player1.clickCard(context.swoopDown);
            context.player1.clickCard(context.allianceXwing);
            context.player1.clickCard(context.consularSecurityForce);

            // should give -2/-0 to target and +2/+0 to attacker because target is on ground arena
            expect(context.player2).toBeActivePlayer();
            expect(context.allianceXwing.damage).toBe(1); // 3-2
            expect(context.consularSecurityForce.damage).toBe(4); // 2+2
        });
    });
});
