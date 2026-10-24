describe('Invasion Lander', function() {
    integration(function(contextRef) {
        it('Invasion Lander\'s when played ability should give each other friendly unit +2/+2 for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['invasion-lander'],
                    spaceArena: ['lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                    groundArena: ['rebel-pathfinder'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invasionLander);

            expect(context.player2).toBeActivePlayer();

            // Should have no pump
            expect(context.invasionLander.getPower()).toBe(3);
            expect(context.invasionLander.getHp()).toBe(7);

            // Should have +2/+2
            expect(context.lurkingTiePhantom.getPower()).toBe(4);
            expect(context.lurkingTiePhantom.getHp()).toBe(4);
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(5);
            expect(context.cadBane.getPower()).toBe(4);
            expect(context.cadBane.getHp()).toBe(10);

            // Should have no pump
            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.grandInquisitor.getHp()).toBe(6);

            context.moveToNextActionPhase();

            // Should have no pump
            expect(context.invasionLander.getPower()).toBe(3);
            expect(context.invasionLander.getHp()).toBe(7);

            // pump should be gone
            expect(context.lurkingTiePhantom.getPower()).toBe(2);
            expect(context.lurkingTiePhantom.getHp()).toBe(2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.cadBane.getHp()).toBe(8);

            // Should have no pump
            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.grandInquisitor.getHp()).toBe(6);
        });
    });
});