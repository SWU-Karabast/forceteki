describe('Cargo Juggernaut', function () {
    integration(function () {
        describe('Cargo Juggernaut\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cargo-juggernaut'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['rugged-survivors']
                    }
                });
            });

            it('should heal base when there is a Vigilance ally', function () {
                this.p1Base.damage = 10;
                this.player1.clickCard(this.cargoJuggernaut);
                this.player1.clickPrompt('If you control another Vigilance unit, heal 4 damage from your base');

                expect(this.player2).toBeActivePlayer();
                expect(this.p1Base.damage).toBe(6);
            });
        });

        describe('Cargo Juggernaut\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cargo-juggernaut'],
                    },
                    player2: {
                        groundArena: ['rugged-survivors']
                    }
                });
            });

            it('should not heal base where there is not any Vigilance ally', function () {
                this.p1Base.damage = 10;
                this.player1.clickCard(this.cargoJuggernaut);
                this.player1.clickPrompt('If you control another Vigilance unit, heal 4 damage from your base');

                expect(this.player2).toBeActivePlayer();
                expect(this.p1Base.damage).toBe(10);
            });
        });
    });
});
