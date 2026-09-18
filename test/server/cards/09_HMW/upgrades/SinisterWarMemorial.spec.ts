describe('Sinister War Memorial', function() {
    integration(function(contextRef) {
        it('Sinister War Memorial\'s ability should heal 1 damage from base when a friendly unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'porg'],
                    base: { card: 'kestro-city', damage: 3, upgrades: ['sinister-war-memorial'] },
                },
                player2: {
                    groundArena: ['rey#skywalker', 'yoda#old-master'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rey);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);

            context.player1.passAction();

            context.player2.clickCard(context.yoda);
            context.player2.clickCard(context.porg);

            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(1);
        });

        it('Sinister War Memorial\'s ability should not trigger when an enemy unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    base: { card: 'kestro-city', damage: 3, upgrades: ['sinister-war-memorial'] },
                },
                player2: {
                    groundArena: ['wampa'],
                    base: { card: 'colossus', damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
