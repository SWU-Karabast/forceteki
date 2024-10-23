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
                        groundArena: ['wampa', 'mandalorian-warrior', 'atst', 'atat-suppressor'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('may deal the excess damage from defeating a unit to another unit', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.setDamage(context.blizzardAssaultAtat, 0);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: AT-AT attack defeats a unit
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInLocation('discard');
                expect(context.blizzardAssaultAtat.damage).toBe(4);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.atst, context.atatSuppressor]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                reset();

                // // CASE 2: Mace attacks and does not defeat, ability does not trigger
                // context.blizzardAssaultAtat.exhausted = false;
                // context.player1.clickCard(context.blizzardAssaultAtat);
                // context.player1.clickCard(context.atst);
                // expect(context.atst.damage).toBe(5);
                // expect(context.blizzardAssaultAtat.damage).toBe(6);
                // expect(context.blizzardAssaultAtat.exhausted).toBeTrue();

                // reset(false);

                // // CASE 3: Enemy attacks into Mace and dies, ability doesn't trigger
                // context.blizzardAssaultAtat.exhausted = true;
                // context.player2.clickCard(context.atst);
                // context.player2.clickCard(context.blizzardAssaultAtat);
                // expect(context.atst).toBeInLocation('discard');
                // expect(context.blizzardAssaultAtat.damage).toBe(6);
                // expect(context.blizzardAssaultAtat.exhausted).toBeTrue();

                // reset(false);

                // // CASE 4: friendly unit trades with enemy unit, Mace ability does not trigger
                // context.blizzardAssaultAtat.exhausted = true;
                // context.player1.clickCard(context.battlefieldMarine);
                // context.player1.clickCard(context.mandalorianWarrior);
                // expect(context.battlefieldMarine).toBeInLocation('discard');
                // expect(context.mandalorianWarrior).toBeInLocation('discard');
                // expect(context.blizzardAssaultAtat.exhausted).toBeTrue();

                // reset();

                // // CASE 5: Mace dies while attacking, ability fizzles
                // context.blizzardAssaultAtat.exhausted = false;
                // context.player1.clickCard(context.blizzardAssaultAtat);
                // context.player1.clickCard(context.atatSuppressor);
                // expect(context.blizzardAssaultAtat).toBeInLocation('discard');
                // expect(context.atatSuppressor.damage).toBe(5);
            });
        });

        // describe('Mace\'s triggered ability', function() {
        //     beforeEach(function () {
        //         contextRef.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: [{ card: 'mace-windu#party-crasher', upgrades: ['fallen-lightsaber'] }]
        //             },
        //             player2: {
        //                 groundArena: ['jawa-scavenger']
        //             }
        //         });
        //     });

        //     it('will not ready him if the unit is defeated by an on-attack ability', function () {
        //         const { context } = contextRef;

        //         context.player1.clickCard(context.blizzardAssaultAtat);
        //         context.player1.clickCard(context.jawaScavenger);

        //         expect(context.jawaScavenger).toBeInLocation('discard');
        //         expect(context.blizzardAssaultAtat.damage).toBe(0);
        //         expect(context.blizzardAssaultAtat.exhausted).toBeTrue();
        //     });
        // });
    });
});
