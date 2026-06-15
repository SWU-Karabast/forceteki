describe('Treacherous Minefield', function () {
    integration(function (contextRef) {
        it('Treacherous Minefield\'s ability should give each space unit the on attack ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['treacherous-minefield'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    spaceArena: ['green-squadron-awing', 'red-squadron-xwing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['consular-security-force', 'wilderness-fighter'],
                    spaceArena: ['pirated-starfighter', 'strafing-gunship'],
                    leader: 'rio-durant#wisecracking-wheelman',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rioDurant);
            context.player2.clickPrompt('Deploy Rio Durant as a pilot');
            context.player2.clickCard(context.strafingGunship);

            context.player1.clickCard(context.treacherousMinefield);
            context.player1.clickPrompt('Space');

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(2);

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player2.clickCard(context.piratedStarfighter);
            context.player2.clickCard(context.p1Base);
            expect(context.piratedStarfighter.damage).toBe(2);

            context.player1.clickCard(context.redSquadronXwing);
            context.player1.clickCard(context.p2Base);
            expect(context.redSquadronXwing.damage).toBe(2);

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(0);

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(0);

            context.moveToNextActionPhase();

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(2);

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player2.clickCard(context.piratedStarfighter);
            context.player2.clickCard(context.p1Base);
            expect(context.piratedStarfighter.damage).toBe(2);

            context.player1.clickCard(context.redSquadronXwing);
            context.player1.clickCard(context.p2Base);
            expect(context.redSquadronXwing.damage).toBe(2);

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(0);

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('Treacherous Minefield\'s ability should give each ground unit the on attack ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['treacherous-minefield'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    spaceArena: ['green-squadron-awing', 'red-squadron-xwing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['consular-security-force', 'wilderness-fighter'],
                    spaceArena: ['pirated-starfighter', 'strafing-gunship'],
                    leader: 'rio-durant#wisecracking-wheelman'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.treacherousMinefield);
            context.player1.clickPrompt('Ground');

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.battlefieldMarine.damage).toBe(2);

            context.player2.clickCard(context.consularSecurityForce);
            context.player2.clickCard(context.p1Base);
            expect(context.consularSecurityForce.damage).toBe(2);

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(2);

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(2);

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(0);

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(0);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.battlefieldMarine.damage).toBe(2);

            context.player2.clickCard(context.consularSecurityForce);
            context.player2.clickCard(context.p1Base);
            expect(context.consularSecurityForce.damage).toBe(2);

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(2);

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(2);

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(0);

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(0);

            expect(context.player1).toBeActivePlayer();
        });

        it('Treacherous Minefield\'s ability should not give the On Attack if there are no legal targets on the ground', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['treacherous-minefield'],
                    spaceArena: ['green-squadron-awing', 'red-squadron-xwing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    spaceArena: ['pirated-starfighter', 'strafing-gunship'],
                    leader: 'rio-durant#wisecracking-wheelman'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.treacherousMinefield);
            context.player1.clickPrompt('Ground');

            context.player2.passAction();

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(0);

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(0);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.greenSquadronAwing.damage).toBe(0);

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);
            expect(context.strafingGunship.damage).toBe(0);

            expect(context.player1).toBeActivePlayer();
        });

        it('Treacherous Minefield\'s ability should not give the on attack if there are no legal targets in space', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['treacherous-minefield'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['consular-security-force', 'wilderness-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.treacherousMinefield);
            context.player1.clickPrompt('Space');

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(0);

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(0);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);
            expect(context.cadBane.damage).toBe(0);

            context.player2.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.wildernessFighter.damage).toBe(0);

            expect(context.player1).toBeActivePlayer();
        });

        it('Treacherous Minefield\'s ability should auto resolve if there are no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['treacherous-minefield'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.treacherousMinefield);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
