describe('Northern Curtain Wall', function() {
    integration(function() {
        describe('Northern Curtain Wall Constant Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-kuwanan']
                    },
                    player2: {
                        inPlay: ['hida-kisada'],
                        dynastyDiscard: ['watchtower-of-valor', 'northern-curtain-wall', 'imperial-storehouse', 'third-whisker-warrens', 'kaiu-forges', 'river-of-the-last-stand', 'seventh-tower']
                    }
                });

                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.kisada = this.player2.findCardByName('hida-kisada');
                this.watchtower = this.player2.placeCardInProvince('watchtower-of-valor', 'province 1');
                this.wall = this.player2.placeCardInProvince('northern-curtain-wall', 'province 2');
                this.storehouse = this.player2.placeCardInProvince('imperial-storehouse', 'province 3');

                this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
                this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
                this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
                this.p4 = this.player2.findCardByName('shameful-display', 'province 4');

                this.player1p1 = this.player1.findCardByName('shameful-display', 'province 1');
            });

            it('should add 2 to the strength for adjacient kaiu walls', function () {
                expect(this.p1.getStrength()).toBe(3 + 1 + 2);
                expect(this.p2.getStrength()).toBe(3 + 4);
                expect(this.p3.getStrength()).toBe(3 + 1);
                expect(this.p4.getStrength()).toBe(3);
            });

            it('testing for each wall - third whisker warrens', function () {
                this.player2.placeCardInProvince('third-whisker-warrens', 'province 1');
                expect(this.p1.getStrength()).toBe(3 + 1 + 2);
            });

            it('testing for each wall - kaiu forges', function () {
                this.player2.placeCardInProvince('kaiu-forges', 'province 1');
                expect(this.p1.getStrength()).toBe(3 + 3 + 2);
            });

            it('testing for each wall - river of the last stand', function () {
                this.player2.placeCardInProvince('river-of-the-last-stand', 'province 1');
                expect(this.p1.getStrength()).toBe(3 + 0 + 2);
            });

            it('testing for each wall - seventh tower', function () {
                this.player2.placeCardInProvince('seventh-tower', 'province 1');
                expect(this.p1.getStrength()).toBe(3 + 2 + 2);
            });
        });
    });
});

