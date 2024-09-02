describe('Snowtrooper Lieutenant', function() {
    integration(function() {
        describe('Snowtrooper lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['snowtrooper-lieutenant'],
                        groundArena: ['wampa', 'admiral-piett#captain-of-the-executor']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allowing triggering an attack by a unit when played', function () {
                this.player1.clickCard(this.snowtrooperLieutenant);
                expect(this.snowtrooperLieutenant).toBeInLocation('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.admiralPiett]);

                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.sundariPeacekeeper]);

                this.player1.clickCard(this.sundariPeacekeeper);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.sundariPeacekeeper.damage).toBe(4);
            });

            it('if used with an imperial unit should give it +2 power', function () {
                this.player1.clickCard(this.snowtrooperLieutenant);

                this.player1.clickCard(this.admiralPiett);
                this.player1.clickCard(this.sundariPeacekeeper);
                expect(this.sundariPeacekeeper.damage).toBe(3);
                expect(this.admiralPiett.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                this.player2.passAction();
                this.admiralPiett.exhausted = false;
                this.player1.clickCard(this.admiralPiett);
                this.player1.clickCard(this.sundariPeacekeeper);

                expect(this.admiralPiett.damage).toBe(2);
                expect(this.sundariPeacekeeper.damage).toBe(4);
            });
        });
    });
});
