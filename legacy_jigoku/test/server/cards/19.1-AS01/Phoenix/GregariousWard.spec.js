describe('Gregarious Ward', function () {
    integration(function () {
        describe('Gregarious Ward\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 3,
                        inPlay: ['gregarious-ward']
                    },
                    player2: {
                        inPlay: [
                            'borderlands-defender',
                            'steadfast-witch-hunter'
                        ]
                    }
                });

                this.gregariousWard =
                    this.player1.findCardByName('gregarious-ward');

                this.borderlandsDefender = this.player2.findCardByName(
                    'borderlands-defender'
                );
                this.steadfastWitchHunter = this.player2.findCardByName(
                    'steadfast-witch-hunter'
                );

                this.shamefulDisplay = this.player2.findCardByName(
                    'shameful-display',
                    'province 1'
                );

                this.noMoreActions();
            });

            it('should trigger after winning a conflict where controller has more participants than the opponent', function () {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gregariousWard],
                    defenders: [],
                    province: this.shamefulDisplay
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.gregariousWard);
                expect(this.gregariousWard.fate).toBe(1);
            });

            it('should not trigger after winning a conflict where controller has less or equal participants than the opponent', function () {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gregariousWard],
                    defenders: [this.steadfastWitchHunter]
                });
                this.noMoreActions();
                expect(this.gregariousWard.fate).toBe(0);
            });

            it('should not trigger after losing a conflict', function () {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gregariousWard],
                    defenders: [
                        this.borderlandsDefender,
                        this.steadfastWitchHunter
                    ]
                });
                this.noMoreActions();
                expect(this.game.currentConflict).toBeNull();
                expect(this.player1).toHavePrompt('Action Window');
                expect(this.gregariousWard.fate).toBe(0);
            });
        });
    });
});
