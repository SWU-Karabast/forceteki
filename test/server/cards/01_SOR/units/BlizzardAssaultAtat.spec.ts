describe('Blizzard Assault AT-AT', function() {
    integration(function(contextRef) {
        describe('Blizzard Assault AT-AT\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'blizzard-assault-atat']
                    },
                    player2: {
                        groundArena: ['wampa', 'mandalorian-warrior', 'atst', 'chewbacca#pykesbane', 'krayt-dragon'],
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('may deal the excess damage from defeating a unit to another unit', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.setDamage(context.blizzardAssaultAtat, 0);
                    context.blizzardAssaultAtat.exhausted = false;
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: AT-AT attack defeats a unit, ability triggers
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.blizzardAssaultAtat.damage).toBe(4);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.atst, context.chewbacca, context.kraytDragon]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 2: AT-AT attacks and does not defeat, ability does not trigger
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.chewbacca);
                expect(context.chewbacca.damage).toBe(9);
                expect(context.blizzardAssaultAtat.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                reset(false);
                context.setDamage(context.chewbacca, 0);

                // CASE 3: Enemy attacks into AT-AT and dies, ability does not trigger
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.blizzardAssaultAtat);
                expect(context.atst).toBeInZone('discard');
                expect(context.blizzardAssaultAtat.damage).toBe(6);
                expect(context.player1).toBeActivePlayer();

                reset(false);

                // CASE 4: friendly unit trades with enemy unit, AT-AT ability does not trigger
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.mandalorianWarrior).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 5: AT-AT trades, ability triggers
                context.blizzardAssaultAtat.exhausted = false;
                context.setDamage(context.kraytDragon, 2);
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.kraytDragon);
                expect(context.blizzardAssaultAtat).toBeInZone('discard');

                expect(context.player1).toHavePassAbilityPrompt('Deal the excess damage from the attack to an enemy ground unit');
                context.player1.clickPrompt('Deal the excess damage from the attack to an enemy ground unit');
                expect(context.chewbacca.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Blizzard Assault AT-AT\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'blizzard-assault-atat', upgrades: ['hardpoint-heavy-blaster'] }]
                    },
                    player2: {
                        groundArena: ['jawa-scavenger']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('will not trigger if the unit is defeated by an on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.jawaScavenger);

                // hardpoint heavy blaster ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.jawaScavenger, context.blizzardAssaultAtat]);
                context.player1.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toBeInZone('discard');
                expect(context.blizzardAssaultAtat.damage).toBe(0);
                expect(context.blizzardAssaultAtat.exhausted).toBeTrue();
            });
        });

        describe('Blizzard Assault AT-AT\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'blizzard-assault-atat', upgrades: ['heroic-resolve'] }]
                    },
                    player2: {
                        groundArena: ['wampa', 'krayt-dragon'],
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('will not trigger if Overwhelm has used up the excess damage from the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                context.player1.clickCard(context.kraytDragon);

                expect(context.kraytDragon).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
