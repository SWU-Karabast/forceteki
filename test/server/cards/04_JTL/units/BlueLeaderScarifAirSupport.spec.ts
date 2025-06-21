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

                expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', 'Ambush']);
                context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickPrompt('Trigger');
                expect(context.player1.readyResourceCount).toBe(readyResources - 2);

                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.blueLeader.exhausted).toBeTrue();
            });

            it('should allow ambush first and then paying 2 to move it to the ground arena and get two experience', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', 'Ambush']);

                context.player1.clickPrompt('Ambush');
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly(context.piratedStarfighter);
                context.player1.clickCard(context.piratedStarfighter);

                expect(context.blueLeader.damage).toBe(2);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                const readyResources = context.player1.readyResourceCount;
                context.player1.clickPrompt('Trigger');
                expect(context.player1.readyResourceCount).toBe(readyResources - 2);

                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.blueLeader.exhausted).toBeTrue();
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
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', '(No effect) Ambush']);

            context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.blueLeader.exhausted).toBeTrue();

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
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', 'Ambush']);

            context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.blueLeader.exhausted).toBeTrue();

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
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', '(No effect) Ambush']);
            context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);
            expect(context.blueLeader.exhausted).toBeTrue();

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

        it('Blue Leader\'s when played ability should preserve its exhaust state and delayed effects', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blue-leader#scarif-air-support', 'sneak-attack']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sneakAttack);
            context.player1.clickCard(context.blueLeader);
            expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', '(No effect) Ambush']);

            context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');

            const readyResources = context.player1.readyResourceCount;
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(readyResources - 2);

            expect(context.blueLeader).toBeInZone('groundArena');
            expect(context.blueLeader).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.blueLeader.exhausted).toBeFalse();

            context.moveToRegroupPhase();

            expect(context.blueLeader).toBeInZone('discard');
        });

        describe('After Blue Leader has moved to the ground arena', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'blue-leader#scarif-air-support',
                            'death-space-skirmisher',
                            'victor-leader#leading-from-the-front'
                        ],
                        spaceArena: ['supporting-eta2']
                    },
                    player2: {
                        hand: ['shoot-down', 'wild-rancor', 'takedown']
                    }
                });

                // setup Blue Leader in ground arena for each test
                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                expect(context.player1).toHaveExactPromptButtons(['Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it', '(No effect) Ambush']);
                context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                context.player1.clickPrompt('Trigger');
            });

            it('it should not be explicitly targetable for \'choose a space unit\' effects', function() {
                const { context } = contextRef;

                // confirm that Blue Leader isn't targetable
                context.player2.clickCard(context.shootDown);
                expect(context.player2).toBeAbleToSelectExactly(context.supportingEta2);
                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('it should be explicitly targetable for \'choose a ground unit\' effects', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.supportingEta2);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly(context.blueLeader);
                context.player1.clickCard(context.blueLeader);
                expect(context.blueLeader.getPower()).toBe(7);

                expect(context.player2).toBeActivePlayer();
            });

            it('it should be explicitly targetable for \'choose a ground unit\' effects', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.supportingEta2);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly(context.blueLeader);
                context.player1.clickCard(context.blueLeader);
                expect(context.blueLeader.getPower()).toBe(7);

                expect(context.player2).toBeActivePlayer();
            });

            it('it should not be counted for \'if you control a space unit\' conditions', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.supportingEta2);

                context.player1.clickCard(context.deathSpaceSkirmisher);
                expect(context.player2).toBeActivePlayer();
            });

            it('it should not be counted for ongoing effects that target all space units', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.victorLeader);
                expect(context.blueLeader.getPower()).toBe(5);
                expect(context.blueLeader.getHp()).toBe(5);
            });

            it('it should be counted for triggered effects that target all ground units', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.wildRancor);
                expect(context.blueLeader.damage).toBe(2);
            });
        });
    });
});
