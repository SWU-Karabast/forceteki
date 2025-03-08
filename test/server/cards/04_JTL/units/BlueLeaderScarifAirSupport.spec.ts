describe('Blue Leader, Scarif Air Support', function() {
    integration(function(contextRef) {
        describe('Blue Leader\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blue-leader#scarif-air-support']
                    },
                    player2: {
                        spaceArena: ['pirated-starfighter']
                    }
                });
            });

            it('should allow paying 2 to move it to the ground arena and get two experience, ambush fizzles due to no target', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);

                expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);
                context.player1.clickPrompt('Pay 2 resources');
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources');

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickPrompt('Trigger');
                expect(context.player1.readyResourceCount).toBe(readyResources - 2);

                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('should allow ambush first and then paying 2 to move it to the ground arena and get two experience', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);

                context.player1.clickPrompt('Ambush');
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly(context.piratedStarfighter);
                context.player1.clickCard(context.piratedStarfighter);

                expect(context.blueLeader.damage).toBe(2);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources');
                const readyResources = context.player1.readyResourceCount;
                context.player1.clickPrompt('Trigger');
                expect(context.player1.readyResourceCount).toBe(readyResources - 2);

                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.blueLeader.damage).toBe(2);
            });
        });

        it('Blue Leader\'s when played ability should allowing triggering ambush against a ground unit when there is no space unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blue-leader#scarif-air-support']
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blueLeader);
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);

            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);
            context.player1.clickPrompt('Pay 2 resources');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly(context.consularSecurityForce);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(5);
            expect(context.blueLeader.damage).toBe(3);
        });

        it('Blue Leader\'s when played ability should allowing triggering ambush against a ground unit when there is a space unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blue-leader#scarif-air-support']
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['pirated-starfighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blueLeader);
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);

            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);
            context.player1.clickPrompt('Pay 2 resources');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly(context.consularSecurityForce);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(5);
            expect(context.blueLeader.damage).toBe(3);
            expect(context.piratedStarfighter.damage).toBe(0);
        });
    });
});
