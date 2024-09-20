describe('Fallen Lightsaber', function() {
    integration(function() {
        describe('Fallen Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'guardian-of-the-whills', upgrades: ['fallen-lightsaber'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 1 damage to all enemy ground units on attack when attached to a Force unit', function () {
                this.player1.clickCard(this.guardianOfTheWhills);
                this.player1.clickCard(this.p2Base);

                expect(this.p2Base.damage).toBe(5);
                expect(this.snowspeeder.damage).toBe(1);
                expect(this.wampa.damage).toBe(1);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.guardianOfTheWhills.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);

                // second attack with no saber to confirm the effect is gone
                this.fallenLightsaber.unattach();
                this.player1.moveCard(this.fallenLightsaber, 'discard');
                this.guardianOfTheWhills.exhausted = false;
                this.player2.passAction();

                this.player1.clickCard(this.guardianOfTheWhills);
                this.player1.clickCard(this.p2Base);

                expect(this.p2Base.damage).toBe(7);
                expect(this.snowspeeder.damage).toBe(1);
                expect(this.wampa.damage).toBe(1);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.guardianOfTheWhills.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);
            });
        });

        describe('Fallen Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['fallen-lightsaber'] }, 'atst'],
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 1 damage to all enemy ground units on attack when attached to a Force unit', function () {
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.p2Base);

                expect(this.p2Base.damage).toBe(6);
                expect(this.snowspeeder.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.atst.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);
            });
        });

        describe('Fallen Lightsaber', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fallen-lightsaber'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },
                    player2: {
                    }
                });
            });

            it('should not be playable on vehicles', function () {
                this.player1.clickCard(this.fallenLightsaber);
                expect(this.battlefieldMarine.upgrades).toContain(this.fallenLightsaber);
            });
        });
    });
});
