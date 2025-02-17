describe('Barriss Offee Unassuming Apprentice ability\'s', function() {
    integration(function(contextRef) {
        it('should give +1/0 to all friendly units healed this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair', 'redemption#medical-frigate'],
                    groundArena: [
                        { card: 'barriss-offee#unassuming-apprentice', damage: 1, upgrades: ['resilient'] },
                        { card: 'battlefield-marine', damage: 2 },
                        { card: 'consular-security-force', damage: 0 },
                        'wampa'
                    ],
                    spaceArena: [
                        'alliance-xwing',
                        { card: 'green-squadron-awing', damage: 2 },
                    ],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: [{ card: 'atst', damage: 3 }, 'reinforcement-walker'],
                    spaceArena: ['tieln-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.battlefieldMarine, 2],
                [context.consularSecurityForce, 1], // If undamaged it should not give +1/+0
                [context.greenSquadronAwing, 1], // It works also for space units
                [context.atst, 1], // We can heal opponent's unit but it should not give +1/+0
            ]));

            // Units who should get +1/+0
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.greenSquadronAwing.getPower()).toBe(2);
            expect(context.greenSquadronAwing.getHp()).toBe(3);

            // UNits who should not get +1/+0
            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.consularSecurityForce.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
            expect(context.barrissOffee.getPower()).toBe(1);
            expect(context.barrissOffee.getHp()).toBe(4);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.reinforcementWalker.getPower()).toBe(6);
            expect(context.reinforcementWalker.getHp()).toBe(9);
            expect(context.tielnFighter.getPower()).toBe(2);
            expect(context.tielnFighter.getHp()).toBe(1);
            expect(context.redemption.getPower()).toBe(6);
            expect(context.redemption.getHp()).toBe(9);
            context.player2.passAction();

            // If we heal Barriss Offee, it should get +1/+0 too
            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.barrissOffee);
            expect(context.barrissOffee.getPower()).toBe(2);
            expect(context.barrissOffee.getHp()).toBe(4);

            // It should end at the end of the phase
            context.moveToNextActionPhase();
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.barrissOffee.getPower()).toBe(1);
            expect(context.barrissOffee.getHp()).toBe(4);

            // It should also end if Barriss Offee is defeated
            context.player1.passAction();
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.redemption);

            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.greenSquadronAwing, 1],
            ]));
            expect(context.greenSquadronAwing.getPower()).toBe(2);
            expect(context.greenSquadronAwing.getHp()).toBe(3);

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.barrissOffee);
            expect(context.barrissOffee).toBeInZone('discard');
            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
        });

        it('should not give +1/+0 to a new copy of a unit not healed while the first copy was healed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'repair'],
                    groundArena: [
                        { card: 'barriss-offee#unassuming-apprentice', damage: 1, upgrades: ['resilient'] },
                        { card: 'battlefield-marine', damage: 2 }
                    ],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            // We start by healing the first copy of Battlefield Marine
            context.player1.clickCard(context.repair);
            const battlefieldMarines = context.player1.findCardsByName('battlefield-marine');
            const firstBattlefieldMarine = battlefieldMarines.filter((card) => card.zoneName === 'groundArena')[0];
            const secondBattlefieldMarine = battlefieldMarines.filter((card) => card.zoneName === 'hand')[0];
            context.player1.clickCard(firstBattlefieldMarine);
            expect(firstBattlefieldMarine.getPower()).toBe(4);
            expect(firstBattlefieldMarine.getHp()).toBe(3);

            // We defeat the first copy of Battlefield Marine
            context.player2.clickCard(context.atst);
            context.player2.clickCard(firstBattlefieldMarine);
            expect(firstBattlefieldMarine).toBeInZone('discard');

            // We play a new copy of Battlefield Marine, it should not have +1/+0
            context.player1.clickCard(secondBattlefieldMarine);
            expect(secondBattlefieldMarine.getPower()).toBe(3);
            expect(secondBattlefieldMarine.getHp()).toBe(3);
        });
    });
});
