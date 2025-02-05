describe('I Have The High Ground', function () {
    integration(function (contextRef) {
        it('I Have The High Ground\'s ability should modify attackers power by -4 when targetting the selected friendly unit for this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['i-have-the-high-ground'],
                    groundArena: ['battlefield-marine', 'plo-koon#kohtoyah']
                },
                player2: {
                    groundArena: ['wampa', 'wrecker#boom', 'clone-trooper']
                }
            });

            const { context } = contextRef;

            // Apply event
            context.player1.clickCard(context.iHaveTheHighGround);
            context.player1.clickCard(context.ploKoon);

            // unit attacked, -4 to attacker
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('groundArena');
            expect(context.ploKoon.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);

            context.player1.passAction();

            // 2nd unit attacked, -4 applied
            context.player2.clickCard(context.wrecker);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('groundArena');
            expect(context.ploKoon.damage).toBe(3);
            expect(context.wrecker.damage).toBe(3);

            context.player1.passAction();

            // Another unit attacked, to ensure -4 isnt applied globally
            context.player2.clickCard(context.cloneTrooper);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.cloneTrooper).toBeInZone('outsideTheGame');
            expect(context.battlefieldMarine.damage).toBe(2);

            //  Move to next phase to remove Event effect
            context.setDamage(context.wampa, 0);
            context.moveToNextActionPhase();
            context.player1.passAction();

            // Event removed check
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('discard');
        });
    });
});
