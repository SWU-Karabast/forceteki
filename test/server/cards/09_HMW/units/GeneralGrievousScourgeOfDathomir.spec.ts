describe('General Grievous, Scourge of Dathomir', function() {
    integration(function(contextRef) {
        it('General Grievous\' when played ability should deal 4 damage to a base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['general-grievous#scourge-of-dathomir'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.generalGrievous);
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
        });

        it('General Grievous\' constant ability should disable healing for base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#old-master'],
                    base: { card: 'colossus', damage: 10 }
                },
                player2: {
                    groundArena: ['general-grievous#scourge-of-dathomir'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(10);
        });

        it('General Grievous\' constant ability should not disable healing', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'rose-tico#saving-what-we-love', deployed: true },
                    groundArena: [{ card: 'war-juggernaut', damage: 3 }],
                },
                player2: {
                    groundArena: ['general-grievous#scourge-of-dathomir'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.warJuggernaut);

            expect(context.player2).toBeActivePlayer();
            expect(context.warJuggernaut.damage).toBe(1);
        });
    });
});
