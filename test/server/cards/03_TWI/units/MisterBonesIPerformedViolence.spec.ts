describe('Mister Bones, I Performed Violence', function () {
    integration(function (contextRef) {
        it('Mister Bones\'s ability should not deal any damage if there is card in controller\'s hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['resupply'],
                    groundArena: ['mister-bones#i-performed-violence']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.misterBones);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mister Bones\'s ability should deal 3 damage to a ground unit if there is no card in controller\'s hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['mister-bones#i-performed-violence']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.misterBones);
            context.player1.clickCard(context.p2Base);

            // mister bones ability, should dela 3 damage to a ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.misterBones, context.battlefieldMarine, context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
