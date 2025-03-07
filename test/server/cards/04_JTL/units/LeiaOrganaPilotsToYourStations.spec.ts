describe('Leia Organa, Pilots to your stations', function() {
    integration(function(contextRef) {
        it('Leia Organa\'s ability should allow to attack with a pilot unit or a unit with a pilot attached and give it restor 1 and +1/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leia-organa#pilots-to-your-stations'],
                    groundArena: ['wingman-victor-three#backstabber', { card: 'escort-skiff', upgrades: ['bb8#happy-beeps'] }, 'battlefield-marine'],
                    spaceArena: [{ card: 'restored-arc170', upgrades: ['wingman-victor-two#mauler-mithel'] }, 'green-squadron-awing'],
                    base: { card: 'echo-base', damage: 20 }
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['mining-guild-tie-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.escortSkiff, context.wingmanVictorThree]);
            context.player1.clickCard(context.restoredArc170);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
            expect(context.p1Base.damage).toBe(18); // Restore 2 during the attack: 1 from restored arc-170, 1 from leia organa ability
            expect(context.restoredArc170).toBeInZone('spaceArena');
            expect(context.restoredArc170.getPower()).toBe(3); // No persitance of the +1/+0
            expect(context.restoredArc170.getHp()).toBe(4);
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();
            context.player1.clickCard(context.leiaOrgana);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(7);
            expect(context.p1Base.damage).toBe(17); // Restore 1
            expect(context.player2).toBeActivePlayer();
        });
    });
});
