describe('Migrate', function() {
    integration(function(contextRef) {
        it('Migrates\'s ability should create a Beast token for every 3 resources they control', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['migrate'],
                    resources: 10
                },
                player2: {
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migrate);

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(3);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);
        });

        xit('Migrates\'s ability should create a Beast token for every 3 resources they control, but less than 3', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['migrate'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['ahsokas-lightsabers#dont-hurt-them'] }],
                    base: 'echo-base',
                    resources: 2,
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();

            context.player1.clickCard(context.migrate);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(0);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);
        });
    });
});