
describe('Anakin Skywalker, What It Takes To Win', function () {
    integration(function (contextRef) {
        describe('Anakin\'s undeployed ability', function () {
            it('should deal 2 damage to his base and initiate an attack. The attacker should only get +2 attack if attacking a unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#what-it-takes-to-win',
                        groundArena: ['wampa', 'moisture-farmer'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use Anakin and have Wampa attack base - base should take 4 damage
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                context.moveToNextActionPhase();

                // Use Anakin to attack a unit with Moisture Farmer - it should have 2 attack and heal for 2
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should deal 2 damage to his base and lose the game before attack resolves that would heal base', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#what-it-takes-to-win',
                        base: { card: 'dagobah-swamp', damage: 28 },
                        groundArena: ['moisture-farmer'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use Anakin and have Moisture Farmer attack - the game should end before Restore resolves
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.player1).toHavePrompt('player2 has won the game!');
                expect(context.player2).toHavePrompt('player2 has won the game!');
                context.allowTestToEndWithOpenPrompt = true;
            });
        });

        describe('Anakin\'s deployed ability', function () {
            it('Anakin gains attack and does Overwhelm damage', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#what-it-takes-to-win', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 20 },
                        groundArena: ['wampa', 'moisture-farmer'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'village-protectors']
                    }
                });

                const { context } = contextRef;

                // Anakin should have +4 attack for 20 damage
                expect(context.anakinSkywalker.getPower()).toBe(8);
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.villageProtectors);
                expect(context.anakinSkywalker.damage).toBe(2);
                expect(context.villageProtectors).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(6);
            });

            it('when the defender is defeated before damage resolution, all of Anakin\'s power should go to P2 Base', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#what-it-takes-to-win', deployed: true, upgrades: ['jedi-lightsaber'] },
                        base: { card: 'dagobah-swamp', damage: 20 },
                        resources: 6
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'village-protectors']
                    }
                });

                const { context } = contextRef;

                expect(context.anakinSkywalker.getPower()).toBe(11); // 4 base power plus 4 from base damage plus 3 from lightsaber

                // Jedi Lightsaber will kill Village Protectors, and all 11 damage will go to P2 base
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.villageProtectors);
                expect(context.anakinSkywalker.damage).toBe(0);
                expect(context.villageProtectors).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(11);
            });
        });
    });
});
