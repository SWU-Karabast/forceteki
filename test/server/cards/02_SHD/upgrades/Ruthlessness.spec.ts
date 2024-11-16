describe('Ruthlessness', function () {
    integration(function (contextRef) {
        describe('Ruthlessness\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['ruthlessness'] }, 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'specforce-soldier', 'wilderness-fighter', 'regional-governor']
                    }
                });
            });

            it('should deal 2 damage to base when defeating a enemy unit', function () {
                const { context } = contextRef;

                function reset(opponentPass = true) {
                    context.battlefieldMarine.exhausted = false;
                    context.setDamage(context.battlefieldMarine, 0);
                    context.setDamage(context.p2Base, 0);
                    if (opponentPass) {
                        context.player2.passAction();
                    }
                }

                // battlefield marine attack and kill an enemy unit, should deal 2 damage to base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.specforceSoldier.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                reset(false);

                // enemy unit attacks and die : nothing happens
                context.player2.clickCard(context.wildernessFighter);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.wildernessFighter.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                reset(false);

                // friendly unit kill enemy unit, nothing happens
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.regionalGovernor);

                expect(context.wampa.damage).toBe(1);
                expect(context.regionalGovernor.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();

                reset();

                // battlefield marine attacks and die without kill the defender : nothing happens
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);

                expect(context.battlefieldMarine.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Ruthlessness\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['ruthlessness'] }],
                    },
                    player2: {
                        groundArena: ['ardent-sympathizer']
                    }
                });
            });

            it('should deal 2 damage to base when defeating a enemy unit (and die)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.ardentSympathizer);

                expect(context.battlefieldMarine.zoneName).toBe('discard');
                expect(context.ardentSympathizer.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        // TODO: update trigger condition so that defender being defeated by attacker at the 'on attack' stage will also work

        // describe('Ruthlessness\'s ability', function () {
        //     beforeEach(function () {
        //         contextRef.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: [{ card: 'guardian-of-the-whills', upgrades: ['ruthlessness', 'fallen-lightsaber'] }],
        //             },
        //             player2: {
        //                 groundArena: ['jawa-scavenger']
        //             }
        //         });
        //     });
        //
        //     it('should deal 2 damage to base when defeating a enemy unit with on attack ability', function () {
        //         const { context } = contextRef;
        //
        //         context.player1.clickCard(context.guardianOfTheWhills);
        //         context.player1.clickCard(context.jawaScavenger);
        //
        //         expect(context.jawaScavenger).toBeInLocation('discard');
        //         expect(context.guardianOfTheWhills.damage).toBe(0);
        //         expect(context.p2Base.damage).toBe(2);
        //         expect(context.player2).toBeActivePlayer();
        //     });
        // });
    });
});
