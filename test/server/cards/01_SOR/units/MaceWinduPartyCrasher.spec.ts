describe('Mace Windu, Party Crasher', function() {
    integration(function(contextRef) {
        describe('Mace\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mace-windu#party-crasher'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa', 'mandalorian-warrior', 'atst', 'atat-suppressor']
                    }
                });
            });

            it('will ready him if he attacks and defeats a unit', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.setDamage(context.maceWindu, 0);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Mace ambush kills a unit
                context.player1.clickCard(context.maceWindu);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.maceWindu.damage).toBe(4);
                expect(context.maceWindu.exhausted).toBeFalse();

                reset();

                // CASE 2: Mace attacks and does not defeat, ability does not trigger
                context.maceWindu.exhausted = false;
                context.player1.clickCard(context.maceWindu);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);
                expect(context.maceWindu.damage).toBe(6);
                expect(context.maceWindu.exhausted).toBeTrue();

                reset(false);

                // CASE 3: Enemy attacks into Mace and dies, ability doesn't trigger
                context.maceWindu.exhausted = true;
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.maceWindu);
                expect(context.atst).toBeInZone('discard');
                expect(context.maceWindu.damage).toBe(6);
                expect(context.maceWindu.exhausted).toBeTrue();

                reset(false);

                // CASE 4: friendly unit trades with enemy unit, Mace ability does not trigger
                context.maceWindu.exhausted = true;
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.mandalorianWarrior).toBeInZone('discard');
                expect(context.maceWindu.exhausted).toBeTrue();

                reset();

                // CASE 5: Mace dies while attacking, ability fizzles
                context.maceWindu.exhausted = false;
                context.player1.clickCard(context.maceWindu);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.maceWindu).toBeInZone('discard');
                expect(context.atatSuppressor.damage).toBe(5);
            });
        });

        // TODO: update trigger condition so that defender being defeated by attacker at the 'on attack' stage will also work

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
        //
        //     it('will not ready him if the unit is defeated by an on-attack ability', function () {
        //         const { context } = contextRef;
        //
        //         context.player1.clickCard(context.maceWindu);
        //         context.player1.clickCard(context.jawaScavenger);
        //
        //         expect(context.jawaScavenger).toBeInZone('discard');
        //         expect(context.maceWindu.damage).toBe(0);
        //         expect(context.maceWindu.exhausted).toBeFalse();
        //     });
        // });
    });
});
