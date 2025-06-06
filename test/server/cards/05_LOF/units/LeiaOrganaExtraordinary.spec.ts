describe('Leia Organa, Extraordinary', function () {
    integration(function (contextRef) {
        it('Leia Organa\'s ability cannot ready while she is on space arena and should be able to move to ground arena using the force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leia-organa#extraordinary', 'bravado'],
                    spaceArena: ['green-squadron-awing'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['wampa', 'consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);

            // leia is a space unit
            expect(context.leiaOrgana).toBeInZone('spaceArena');

            context.player2.passAction();

            // try to ready leia
            context.player1.clickCard(context.bravado);

            // leia is not selectable
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.consularSecurityForce, context.greenSquadronAwing]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.leiaOrgana.exhausted).toBeTrue();

            // next phase, leia cannot ready
            context.moveToNextActionPhase();

            expect(context.leiaOrgana.exhausted).toBeTrue();

            // move leia to the ground arena
            context.player1.clickCard(context.leiaOrgana);
            expect(context.leiaOrgana).toBeInZone('groundArena');

            // should give +2/+2 to friendly heroism unit
            expect(context.greenSquadronAwing.getPower()).toBe(3);
            expect(context.greenSquadronAwing.getHp()).toBe(5);
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(5);
            expect(context.leiaOrgana.getPower()).toBe(7);
            expect(context.leiaOrgana.getHp()).toBe(7);
            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.consularSecurityForce.getHp()).toBe(7);

            context.player1.setHasTheForce(true);
            context.player2.passAction();

            // leia should not have his ability once she's on the ground
            expect(context.leiaOrgana).not.toHaveAvailableActionWhenClickedBy(context.player1);

            // next phase, leia should be ready and +2/+2 should have expired
            context.moveToNextActionPhase();

            expect(context.leiaOrgana.exhausted).toBeFalse();
            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.leiaOrgana.getPower()).toBe(5);
            expect(context.leiaOrgana.getHp()).toBe(5);
        });

        it('Leia Organa\'s ability can\'t move to the ground arena if player does not have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'leia-organa#extraordinary', exhausted: true }],
                    hasForceToken: false,
                },
            });

            const { context } = contextRef;

            expect(context.leiaOrgana).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});