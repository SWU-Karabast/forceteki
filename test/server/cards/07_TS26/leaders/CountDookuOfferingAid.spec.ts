describe('Count Dooku, Offering Aid', function() {
    integration(function(contextRef) {
        it('Count Dooku\'s undeployed ability should allow attacking with a token unit that gets +1/+0 for the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'count-dooku#offering-aid',
                    groundArena: [{ card: 'wampa', damage: 2 }],
                    base: { card: 'echo-base', damage: 2 },
                    resources: 1
                },
                player2: {
                    base: { card: 'jabbas-palace', damage: 3 }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.countDooku);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(2);
            const p1Droid = context.player1.findCardsByName('battle-droid');
            const p2Droid = context.player2.findCardsByName('battle-droid');

            expect(p1Droid.length).toBe(1);
            expect(p2Droid.length).toBe(1);
        });

        it('Count Dooku\'s undeployed ability should allow attacking with a token unit that gets +1/+0 for the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'count-dooku#offering-aid', deployed: true },
                    groundArena: [{ card: 'wampa', damage: 2 }],
                    base: { card: 'echo-base', damage: 2 },
                },
                player2: {
                    base: { card: 'jabbas-palace', damage: 3 }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.countDooku);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHaveExactPromptButtons(['Restore 2', 'Create 2 Battle Droid tokens']);
            context.player1.clickPrompt('Restore 2');

            expect(context.player2).toBeActivePlayer();
            const p1Droid = context.player1.findCardsByName('battle-droid');
            const p2Droid = context.player2.findCardsByName('battle-droid');

            expect(p1Droid.length).toBe(2);
            expect(p2Droid.length).toBe(0);
        });
    });
});
