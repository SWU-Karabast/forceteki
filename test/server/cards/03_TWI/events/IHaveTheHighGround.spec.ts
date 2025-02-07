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
                    groundArena: ['wampa', 'wrecker#boom', 'clone-trooper', 'warrior-drone', 'cloudrider']
                }
            });

            const { context } = contextRef;

            // Apply event
            context.player1.clickCard(context.iHaveTheHighGround);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ploKoon]);
            context.player1.clickCard(context.ploKoon);

            // unit attacked, -4 to attacker
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('groundArena');
            expect(context.ploKoon.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);

            // Plo Koon attacks to ensure not applied
            context.player1.clickCard(context.ploKoon);
            context.player1.clickCard(context.warriorDrone);
            expect(context.ploKoon.damage).toBe(1);
            expect(context.warriorDrone.damage).toBe(3);

            // 2nd unit attacked, -4 applied
            context.player2.clickCard(context.wrecker);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('groundArena');
            expect(context.ploKoon.damage).toBe(4);
            expect(context.wrecker.damage).toBe(3);

            context.player1.passAction();

            // Another unit attacked, to ensure -4 isnt applied globally
            context.player2.clickCard(context.cloneTrooper);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.cloneTrooper).toBeInZone('outsideTheGame');
            expect(context.battlefieldMarine.damage).toBe(2);

            context.player1.passAction();

            // ambush unit played from hand
            context.player2.clickCard(context.cloudrider);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon.damage).toBe(4);
            expect(context.cloudrider).toBeInZone('discard');

            //  Move to next phase to remove Event effect
            context.setDamage(context.wampa, 0);
            context.moveToNextActionPhase();
            context.player1.passAction();

            // Event effect removed check
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.ploKoon);
            expect(context.ploKoon).toBeInZone('discard');
        });
    });
});
