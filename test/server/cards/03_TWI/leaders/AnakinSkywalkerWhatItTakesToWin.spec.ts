
describe('Anakin Skywalker, What It Takes To Win', function () {
    integration(function (contextRef) {
        describe('Anakin\'s undeployed ability', function () {
            beforeEach(function () {
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
            });

            it('should deal 2 damage to his base and initiate an attack. The attacker should not get 2 extra attack if attacking base', function () {
                const { context } = contextRef;

                // Use Anakin and have Wampa attack base
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                context.moveToNextActionPhase();

                // Use Anakin to attack a unit with Wampa
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.p1Base.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(7); // 3 Overwhelm
            });
        });

        describe('Anakin\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#what-it-takes-to-win', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 20 },
                        hand: ['jedi-lightsaber'],
                        groundArena: ['wampa', 'moisture-farmer'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'village-protectors']
                    }
                });
            });

            it('Anakin gains attack and does Overwhelm damage', function () {
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
                const { context } = contextRef;

                // Anakin should have +4 attack for 20 damage
                expect(context.anakinSkywalker.getPower()).toBe(8);
                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.anakinSkywalker);
                context.player2.passAction();

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
