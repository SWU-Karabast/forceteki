describe('Hardpoint Heavy Blaster', function() {
    integration(function(contextRef) {
        describe('Hardpoint Heavy Blaster\'s ability,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'strafing-gunship', upgrades: ['hardpoint-heavy-blaster'] }, 'cartel-spacer']
                    },
                    player2: {
                        groundArena: ['reinforcement-walker', 'wampa'],
                        spaceArena: ['ruthless-raider']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('when attacking a non-base ground target, should deal 2 damage to a target in the ground arena', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.strafingGunship.exhausted = false;
                    context.strafingGunship.damage = 0;
                    context.player2.passAction();
                };

                // CASE 1: attack unit in ground arena, only ground arena targets available
                context.player1.clickCard(context.strafingGunship);
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.reinforcementWalker, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.reinforcementWalker.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 2: attack unit in space arena, only space arena targets available
                context.player1.clickCard(context.strafingGunship);
                context.player1.clickCard(context.ruthlessRaider);
                expect(context.player1).toBeAbleToSelectExactly([context.strafingGunship, context.ruthlessRaider, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.ruthlessRaider.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 3: attack base, ability does not trigger
                context.player1.clickCard(context.strafingGunship);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Hardpoint Heavy Blaster', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['hardpoint-heavy-blaster'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should only be playable on vehicles', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hardpointHeavyBlaster);
                expect(context.snowspeeder).toHaveExactUpgradeNames(['hardpoint-heavy-blaster']);
            });
        });
    });
});
