describe('Aerie, Cloud-Rider Dropship ability\'s', function () {
    integration(function (contextRef) {
        it('should deal 2 damage to an enemy ground unit and 2 damage to a base on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['aerie#cloudrider-dropship'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aerieCloudriderDropship);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.wampa.damage).toBe(2); // 2 Damage from Aerie's ability
            expect(context.p2Base.damage).toBe(5); // 3 Damage from Aerie's attack + 2 Damage from ability
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 2 damage to a base on attack as there are no enemy ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['aerie#cloudrider-dropship'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aerieCloudriderDropship);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5); // 3 Damage from Aerie's attack + 2 Damage from ability
            expect(context.player2).toBeActivePlayer();
        });
    });
});
