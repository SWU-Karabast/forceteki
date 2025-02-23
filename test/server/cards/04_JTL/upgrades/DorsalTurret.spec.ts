describe('Dorsal Turret\'s attached triggered ability', function() {
    integration(function(contextRef) {
        it('will defeat a unit if it deals combat damage while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dorsal-turret'],
                    groundArena: ['frontier-atrt', 'consular-security-force'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa', 'escort-skiff', 'atst', { card: 'battlefield-marine', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            // Can we attach to only vehicles?
            context.player1.clickCard(context.dorsalTurret);
            expect(context.player1).toBeAbleToSelectExactly([
                context.frontierAtrt,
                context.greenSquadronAwing,
                context.escortSkiff,
                context.atst,
            ]);
            context.player1.clickCard(context.frontierAtrt);
            context.player2.passAction();

            // CASE 1: Frontier AT-RT attacks and survives
            context.player1.clickCard(context.frontierAtrt);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');
            expect(context.frontierAtrt.damage).toBe(4);

            // CASE 2: Frontier AT-RT is attacked, ability doesn't trigger
            context.player2.clickCard(context.escortSkiff);
            context.player2.clickCard(context.frontierAtrt);
            expect(context.escortSkiff).toBeInZone('groundArena');
            expect(context.escortSkiff.damage).toBe(3);
            expect(context.frontierAtrt).toBeInZone('discard');
            expect(context.dorsalTurret).toBeInZone('discard');
        });

        it('will defeat a Leader-unit if it deals combat damage to it while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'frontier-atrt', upgrades: ['dorsal-turret'] }, 'consular-security-force'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa', 'escort-skiff', 'atst', { card: 'battlefield-marine', upgrades: ['shield'] }],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                }
            });

            const { context } = contextRef;

            // CASE 3: Frontier AT-RT do not defeat a unit with a shield on it
            context.player1.clickCard(context.frontierAtrt);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.frontierAtrt.damage).toBe(3);
            context.moveToNextActionPhase();

            // CASE 4: Frontier AT-RT defeat Leader unit
            context.player1.clickCard(context.frontierAtrt);
            context.player1.clickCard(context.lukeSkywalker);
            expect(context.frontierAtrt).toBeInZone('discard');
            expect(context.lukeSkywalker.deployed).toBeFalse();
        });
    });
});
