describe('Sentinel keyword', function() {
    integration(function() {
        describe('When a unit with the Sentinel keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine', 'wookiee-warrior'],
                        spaceArena: ['system-patrol-craft', 'seventh-fleet-defender', 'imperial-interceptor']
                    }
                });
            });

            it('is in play, it must be targeted by an attack', function () {
                this.player1.clickCard(this.liberatedSlaves);
                expect(this.liberatedSlaves.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(0);
                expect(this.liberatedSlaves.damage).toBe(4);
                expect(this.echoBaseDefender).toBeInLocation('discard');
            });
        });

        describe('When two units with the Sentinel keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'pyke-sentinel', 'battlefield-marine', 'wookiee-warrior'],
                        spaceArena: ['system-patrol-craft', 'seventh-fleet-defender', 'imperial-interceptor']
                    }
                });
            });

            it('are in play, either may be targeted by an attack', function () {
                this.player1.clickCard(this.liberatedSlaves);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.echoBaseDefender]);
                this.player1.clickCard(this.echoBaseDefender);
                expect(this.liberatedSlaves.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(0);
                expect(this.liberatedSlaves.damage).toBe(4);
                expect(this.echoBaseDefender).toBeInLocation('discard');
            });
        });
    });
    // TODO add a test for cross-arena Sentinel logic
});
