describe('Hunter\'s Instinct', function() {
    integration(function(contextRef) {
        it('Hunter\'s Instinct should give Grit to an attached Creature unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['hunters-instinct'], damage: 2 }]
                }
            });

            const { context } = contextRef;

            // Wampa is a Creature: 4 power + 2 from the upgrade + 2 from Grit (2 damage on it)
            expect(context.wampa.getPower()).toBe(8);
            expect(context.wampa.getHp()).toBe(6);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(8);
        });

        it('Hunter\'s Instinct should not give Grit to an attached non-Creature unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['hunters-instinct'], damage: 2 }]
                }
            });

            const { context } = contextRef;

            // Battlefield Marine is not a Creature: 3 power + 2 from the upgrade, no Grit bonus
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(4);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
        });

        it('Hunter\'s Instinct should give Grit to an attached Creature unit played from hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hunters-instinct'],
                    groundArena: [{ card: 'porg', damage: 0 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huntersInstinct);
            context.player1.clickCard(context.porg);

            // Porg is a Creature: 1 power + 2 from the upgrade, Grit adds 0 while undamaged
            expect(context.porg.getPower()).toBe(3);
            expect(context.huntersInstinct).toBeAttachedTo(context.porg);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
