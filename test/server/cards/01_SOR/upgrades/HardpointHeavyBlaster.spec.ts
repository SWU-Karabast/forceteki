describe('Hardpoint Heavy Blaster', function() {
    integration(function(contextRef) {
        describe('Hardpoint Heavy Blaster\'s ability,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'atst', upgrades: ['hardpoint-heavy-blaster'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('when attacking a non-base ground target, should deal 2 damage to a target in the ground arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.reinforcementWalker, context.battlefieldMarine, context.atst]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.reinforcementWalker.damage).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });

            // TODO THIS PR: switch to strafing gunship for test once it's done
        });

        describe('Hardpoint Heavy Blaster', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['hardpoint-heavy-blaster'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },
                    player2: {
                    }
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
