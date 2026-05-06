describe('Fearless Attack', function() {
    integration(function(contextRef) {
        it('should initiate an attack and grant +1 power for this attack for each unit controlled by the defending player (3 units)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fearless-attack'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['alliance-xwing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fearlessAttack);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(6);

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });

        it('should initiate an attack and grant +1 power for this attack for each unit controlled by the defending player (1 unit)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fearless-attack'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fearlessAttack);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
