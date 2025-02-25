describe('Mister Bones, I Performed Violence', function () {
    integration(function (contextRef) {
        it('Mister Bones\'s ability should deal 3 damage if there is no card in controller\'s hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resupply'],
                    groundArena: ['mister-bones#i-performed-violence']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.misterBones);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            // empty player hand
            context.player1.clickCard(context.resupply);

            // reset
            context.setDamage(context.p2Base, 0);
            context.misterBones.exhausted = false;

            context.player2.passAction();

            context.player1.clickCard(context.misterBones);
            context.player1.clickCard(context.p2Base);

            // mister bones ability, should deal 3 damage to a ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.misterBones, context.battlefieldMarine, context.consularSecurityForce]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
