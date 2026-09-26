describe('Leia Organa, These Are My Friends', function() {
    integration(function(contextRef) {
        it('Leia Organa\'s ability should heal 1 damage from our base when we play another unit that costs 3 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leia-organa#these-are-my-friends', 'porg', 'yoda#old-master', 'wampa'],
                    base: { card: 'energy-conversion-lab', damage: 10 }
                },
                player2: {
                    hand: ['village-tender'],
                    base: { card: 'shield-generator-complex', damage: 10 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(10);

            context.player2.clickCard(context.villageTender);
            expect(context.player1).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(10);

            context.player1.clickCard(context.yoda);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(9);

            context.player2.passAction();

            context.player1.clickCard(context.porg);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(8);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(8);
        });
    });
});
