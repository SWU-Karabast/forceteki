describe('Stat modifying effects', function() {
    integration(function(contextRef) {
        describe('Power modifying effects', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: [
                            { card: 'tieln-fighter', upgrades: ['academy-training'] },
                            { card: 'cartel-spacer', upgrades: ['entrenched'] }
                        ]
                    }
                });
            });

            it('should not reduce a unit\'s power below 0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disarm);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.tielnFighter, context.cartelSpacer]);

                context.player1.clickCard(context.isbAgent);
                expect(context.isbAgent.getPower()).toBe(0);
            });

            it('should reduce a unit\'s power to 0 accounting for additive effects', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disarm);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.tielnFighter, context.cartelSpacer]);

                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter.getPower()).toBe(0);
            });

            it('should reduce a unit\'s power to above 0 if additive effects are big enough', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disarm);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.tielnFighter, context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.getPower()).toBe(1);
            });
        });

        describe('HP increasing effects', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', damage: 3 }, 'general-dodonna#massassi-group-commander'],
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });
            });

            it('should cause a unit to die when they are removed and its hp is now too low', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.generalDodonna);
                expect(context.generalDodonna).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
            });
        });

        describe('HP modifying effects', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['benthic-two-tubes#partisan-lieutenant', 'alliance-dispatcher', 'jedha-agitator'],
                        groundArena: ['general-dodonna#massassi-group-commander'],
                    },
                    player2: {
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                    }
                });
            });

            it('should be added together correctly', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);
                expect(context.benthicTwoTubes.getHp()).toBe(1);
                expect(context.benthicTwoTubes.getPower()).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.allianceDispatcher);
                expect(context.allianceDispatcher.getHp()).toBe(1);
                expect(context.allianceDispatcher.getPower()).toBe(0);

                context.player2.passAction();

                context.player1.clickCard(context.jedhaAgitator);
                expect(context.jedhaAgitator).toBeInZone('discard');
            });
        });
    });
});
