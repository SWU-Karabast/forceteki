describe('Mon Mothma, Forming a Coalition', function() {
    integration(function(contextRef) {
        it('Mon Mothma\'s undeployed ability ignores aspect penalties for non-Villainy Official units but not for Villainy Officials', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['disaffected-senator', 'general-veers#blizzard-force-commander'],
                    leader: 'mon-mothma#forming-a-coalition',
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['pyke-sentinel']
                }
            });

            const { context } = contextRef;

            // Play Disaffected Senator (Official, non-Villainy). Aspect penalties should be ignored
            expect(context.player1.exhaustedResourceCount).toBe(0);
            context.player1.clickCard(context.disaffectedSenator);
            // Printed cost is 1; with ignored penalties, we should only exhaust 1
            expect(context.player1.exhaustedResourceCount).toBe(1);

            // Opponent passes to keep action simple
            context.player2.passAction();

            // Play General Veers (Official, Villainy). Aspect penalties should NOT be ignored
            context.player1.clickCard(context.generalVeers);
            // General Veers printed cost is 3. Since penalties are NOT ignored for Villainy, total paid should be greater than 3.
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        describe('Mon Mothma\'s deployed ability', function() {
            it('ignores aspect penalties for non-Villainy Official units but not for Villainy Officials', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disaffected-senator', 'general-veers#blizzard-force-commander'],
                        leader: { card: 'mon-mothma#forming-a-coalition', deployed: true },
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Play Disaffected Senator (Official, non-Villainy). Aspect penalties should be ignored
                expect(context.player1.exhaustedResourceCount).toBe(0);
                context.player1.clickCard(context.disaffectedSenator);
                // Printed cost is 1; with ignored penalties, we should only exhaust 1
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Opponent passes to keep action simple
                context.player2.passAction();

                // Play General Veers (Official, Villainy). Aspect penalties should NOT be ignored
                context.player1.clickCard(context.generalVeers);
                // General Veers printed cost is 3. Since penalties are NOT ignored for Villainy, total paid should be greater than 3.
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('grants +0/+1 to each other friendly Official unit (not self, not non-Officials, not enemy)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'aggrieved-parliamentarian'],
                        leader: { card: 'mon-mothma#forming-a-coalition', deployed: true },
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['general-veers#blizzard-force-commander']
                    }
                });

                const { context } = contextRef;

                // Static buff: Each other friendly Official gets +0/+1
                // aggrieved-parliamentarian is an Official and should get +1 HP
                expect(context.aggrievedParliamentarian.getPower()).toBe(2); // stays 2 power
                expect(context.aggrievedParliamentarian.getHp()).toBe(3); // gains +1 hp (from 2 to 3)

                // Leader should NOT buff itself ("each other")
                expect(context.monMothma.getPower()).toBe(3); // unchanged
                expect(context.monMothma.getHp()).toBe(7); // unchanged

                // Non-Official (Wampa) should not receive the buff
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Enemy Official (General Veers) should not receive the buff
                expect(context.generalVeers.getPower()).toBe(3);
                expect(context.generalVeers.getHp()).toBe(3);
            });
        });
    });
});
