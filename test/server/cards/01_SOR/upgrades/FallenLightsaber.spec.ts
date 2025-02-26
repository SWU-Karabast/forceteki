describe('Fallen Lightsaber', function() {
    integration(function(contextRef) {
        describe('Fallen Lightsaber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'guardian-of-the-whills', upgrades: ['fallen-lightsaber'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should deal 1 damage to all enemy ground units on attack when attached to a Force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.guardianOfTheWhills);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.snowspeeder.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.guardianOfTheWhills.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);

                // second attack with no saber to confirm the effect is gone
                context.fallenLightsaber.unattach();
                context.player1.moveCard(context.fallenLightsaber, 'discard');
                context.guardianOfTheWhills.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.guardianOfTheWhills);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(7);
                expect(context.snowspeeder.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.guardianOfTheWhills.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
            });
        });

        describe('Fallen Lightsaber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['fallen-lightsaber'] }, 'atst'],
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not do anything when not attached to a Force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.snowspeeder.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
            });
        });

        describe('Fallen Lightsaber', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fallen-lightsaber'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not be playable on vehicles', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fallenLightsaber);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['fallen-lightsaber']);
            });
        });
    });
});
