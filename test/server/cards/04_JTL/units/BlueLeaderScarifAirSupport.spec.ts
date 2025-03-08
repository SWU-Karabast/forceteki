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

        it('Blue Leader\'s when played ability should move upgrades with the unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'lando-calrissian#buying-time',
                    hand: ['blue-leader#scarif-air-support'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['daring-raid']
                }
            });

            const { context } = contextRef;

            // play Blue Leader using Lando ability and give it a shield while still in the space arena
            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a unit from your hand. If you do and you control a ground unit and a space unit, give a Shield token to a unit');
            context.player1.clickCard(context.blueLeader);

            expect(context.blueLeader).toBeInZone('spaceArena');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.blueLeader]);
            context.player1.clickCard(context.blueLeader);
            expect(context.blueLeader).toHaveExactUpgradeNames(['shield']);

            // move Blue Leader to the ground arena, shield should move with it
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources', 'Ambush']);
            context.player1.clickPrompt('Pay 2 resources');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);

            // confirm that Shield appears in the right arena
            const shield = context.player1.findCardByName('shield');
            expect(shield).toBeInZone('groundArena');

            // pop shield with daring raid
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.blueLeader);
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(shield).toBeInZone('outsideTheGame');
            expect(context.blueLeader.damage).toBe(0);
        });
    });
});
