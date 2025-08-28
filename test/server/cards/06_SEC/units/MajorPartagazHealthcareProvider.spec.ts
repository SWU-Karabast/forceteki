describe('Major Partagaz, Healthcare Provider', function() {
    integration(function(contextRef) {
        it('should give itself +2/+2 for this phase when another friendly Official unit attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['major-partagaz#healthcare-provider', 'wartime-trade-official', 'wampa']
                },
                player2: {}
            });

            const { context } = contextRef;

            const basePower = context.majorPartagaz.getPower();
            const baseHp = context.majorPartagaz.getHp();

            // Attack with another friendly Official (Wartime Trade Official)
            context.player1.clickCard(context.wartimeTradeOfficial);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            // Partagaz should immediately get +2/+2 for this phase
            expect(context.majorPartagaz.getPower()).toBe(basePower + 2);
            expect(context.majorPartagaz.getHp()).toBe(baseHp + 2);

            // End of phase, buff should expire
            context.moveToNextActionPhase();
            expect(context.majorPartagaz.getPower()).toBe(basePower);
            expect(context.majorPartagaz.getHp()).toBe(baseHp);
        });

        it('should give itself +2/+2 for this phase when another friendly Official unit attacks (can trigger multiple time)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['major-partagaz#healthcare-provider', 'wartime-trade-official', 'rune-haako#scheming-second']
                },
                player2: {}
            });

            const { context } = contextRef;

            const basePower = context.majorPartagaz.getPower();
            const baseHp = context.majorPartagaz.getHp();

            // Attack with another friendly Official (Wartime Trade Official)
            context.player1.clickCard(context.wartimeTradeOfficial);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            // Attack with a second friendly Official (Rune Haako)
            context.player1.clickCard(context.runeHaako);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            expect(context.majorPartagaz.getPower()).toBe(basePower + 4);
            expect(context.majorPartagaz.getHp()).toBe(baseHp + 4);
        });

        it('should not trigger when it attacks itself, when a non-Official attacks, or when an opponent\'s Official attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['major-partagaz#healthcare-provider', 'wampa']
                },
                player2: {
                    groundArena: ['wartime-trade-official']
                }
            });

            const { context } = contextRef;
            const basePower = context.majorPartagaz.getPower();
            const baseHp = context.majorPartagaz.getHp();

            // Attack with Partagaz itself (should not count as "another" Official)
            context.player1.clickCard(context.majorPartagaz);
            context.player1.clickCard(context.p2Base);
            expect(context.majorPartagaz.getPower()).toBe(basePower);
            expect(context.majorPartagaz.getHp()).toBe(baseHp);

            // Reset to next action phase for clean second case
            context.moveToNextActionPhase();

            // Attack with a non-Official (Wampa) - should not trigger
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.majorPartagaz.getPower()).toBe(basePower);
            expect(context.majorPartagaz.getHp()).toBe(baseHp);

            // Now opponent attacks with their Official - should not trigger for our Partagaz
            context.player2.clickCard(context.wartimeTradeOfficial);
            context.player2.clickCard(context.p1Base);
            expect(context.majorPartagaz.getPower()).toBe(basePower);
            expect(context.majorPartagaz.getHp()).toBe(baseHp);
        });
    });
});
