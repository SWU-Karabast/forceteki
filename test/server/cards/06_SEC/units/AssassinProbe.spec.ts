describe('Assassin Probe', function () {
    integration(function (contextRef) {
        describe('Assassin Probe\'s ability', function () {
            it('should deal 1 damage to each exhausted enemy ground unit when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'specforce-soldier', exhausted: true }, 'battlefield-marine', 'assassin-probe'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true, exhausted: true },
                    },
                    player2: {
                        hand: ['power-of-the-dark-side', 'no-glory-only-results'],
                        groundArena: [{ card: 'consular-security-force', exhausted: true }, 'wampa', { card: 'fleet-lieutenant', exhausted: true }],
                        spaceArena: [{ card: 'mining-guild-tie-fighter', exhausted: true }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, exhausted: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.assassinProbe);
                expect(context.assassinProbe).toBeInZone('discard');
                expect(context.fleetLieutenant.damage).toBe(1);
                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.grandInquisitorHuntingTheJedi.damage).toBe(1);
                expect(context.miningGuildTieFighter.damage).toBe(0);
                expect(context.miningGuildTieFighter).toBeInZone('spaceArena');
                expect(context.wampa.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
            });

            it('should work with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'specforce-soldier', exhausted: true }, 'battlefield-marine', 'assassin-probe'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true, exhausted: true },
                    },
                    player2: {
                        hand: ['power-of-the-dark-side', 'no-glory-only-results'],
                        groundArena: [{ card: 'consular-security-force', exhausted: true }, 'wampa', { card: 'fleet-lieutenant', exhausted: true }],
                        spaceArena: [{ card: 'mining-guild-tie-fighter', exhausted: true }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, exhausted: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.assassinProbe);
                expect(context.assassinProbe).toBeInZone('discard');
                expect(context.fleetLieutenant.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.grandInquisitorHuntingTheJedi.damage).toBe(0);
                expect(context.miningGuildTieFighter.damage).toBe(0);
                expect(context.miningGuildTieFighter).toBeInZone('spaceArena');
                expect(context.wampa.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(1);
            });
        });
    });
});