describe('Hunting Assassin Droid', function () {
    integration(function (contextRef) {
        it('does not gain Raid 2 when no enemy unit is damaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hunting-assassin-droid', { card: 'wampa', damage: 1 }]
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Attack opponent base to measure damage dealt equals printed power (no +2 from Raid)
            context.player1.clickCard(context.huntingAssassinDroid);
            context.player1.clickCard(context.p2Base);

            // No enemy is damaged, so no Raid 2 bonus should apply; printed power is 3
            expect(context.p2Base.damage).toBe(3);
        });

        it('gains Raid 2 while an enemy unit is damaged (damaged during attack)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'hunting-assassin-droid', upgrades: ['vambrace-flamethrower'] }]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huntingAssassinDroid);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');

            context.player1.setDistributeDamagePromptState(new Map([
                [context.wampa, 3],
            ]));

            expect(context.p2Base.damage).toBe(6); // 3 + 1 + Raid 2
        });

        it('gains Raid 2 while an enemy unit is damaged (adds +2 power on attack)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hunting-assassin-droid']
                },
                player2: {
                    // Damage an enemy unit so the condition is true
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huntingAssassinDroid);
            context.player1.clickCard(context.p2Base);

            // With at least one damaged enemy unit, Raid 2 should grant +2 power while attacking (3 + 2 = 5)
            expect(context.p2Base.damage).toBe(5);
        });
    });
});