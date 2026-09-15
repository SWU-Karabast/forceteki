describe('Low Altitude Combat', function () {
    integration(function (contextRef) {
        it('Low Altitude Combat\'s ability should moves a space unit to the ground arena (friendly), then may attack with a ground unit that gets +2/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-combat'],
                    spaceArena: ['alliance-xwing', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.lowAltitudeCombat);

            // Choose a space unit to move
            expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.awing, context.greenSquadronAwing]);
            context.player1.clickCard(context.allianceXwing);

            // The space unit is now in the ground arena
            expect(context.allianceXwing).toBeInZone('groundArena', context.player1);

            // If you do attack prompt: select a ground attacker or pass
            expect(context.player1).toHavePrompt('Attack with a ground unit. It gets +2/+0 for this attack.');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.allianceXwing);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            expect(context.allianceXwing).toBeInZone('groundArena');
            expect(context.allianceXwing.exhausted).toBeTrue();

            expect(context.allianceXwing.getPower()).toBe(2);
            expect(context.allianceXwing.getHp()).toBe(3);

            expect(context.p2Base.damage).toBe(4);
        });

        it('Low Altitude Combat\'s ability should moves a space unit to the ground arena (friendly), then may pass attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-combat'],
                    spaceArena: ['alliance-xwing', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.lowAltitudeCombat);

            context.player1.clickCard(context.allianceXwing);
            expect(context.allianceXwing).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Attack with a ground unit. It gets +2/+0 for this attack.');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();

            expect(context.allianceXwing.getPower()).toBe(2);
            expect(context.allianceXwing.getHp()).toBe(3);

            expect(context.allianceXwing).toBeInZone('groundArena');
            expect(context.allianceXwing.exhausted).toBeFalsy();
        });

        it('moves a space unit to the ground arena (opponent), then may attack with a ground unit that gets +2/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-combat'],
                    spaceArena: ['alliance-xwing', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lowAltitudeCombat);

            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing).toBeInZone('groundArena', context.player2);

            // If you do attack prompt: select a ground attacker or pass
            expect(context.player1).toHavePrompt('Attack with a ground unit. It gets +2/+0 for this attack.');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toBeInZone('groundArena', context.player2);
            expect(context.p2Base.damage).toBe(5);
        });
    });
});
