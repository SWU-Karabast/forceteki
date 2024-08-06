describe('Unwavering Devotion', function () {
    integration(function () {
        describe('glory bonus', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-youth'],
                        hand: ['unwavering-devotion']
                    },
                    player2: {
                        inPlay: []
                    }
                });
                this.moto = this.player1.findCardByName('moto-youth');
                this.unwaveringDevotion = this.player1.findCardByName('unwavering-devotion');
            });

            it('gives attached character +1 glory when they are honored', function () {
                const initialGlory = this.moto.glory;
                this.moto.honor();
                this.player1.playAttachment(this.unwaveringDevotion, this.moto);
                expect(this.moto.glory).toBe(initialGlory + 1);
            });

            it('gives attached character +1 glory when they are ordinary', function () {
                const initialGlory = this.moto.glory;
                this.player1.playAttachment(this.unwaveringDevotion, this.moto);
                expect(this.moto.glory).toBe(initialGlory + 1);
            });

            it('gives attached character +1 glory when they are dishonored', function () {
                const initialGlory = this.moto.glory;
                this.moto.dishonor();
                this.player1.playAttachment(this.unwaveringDevotion, this.moto);
                expect(this.moto.glory).toBe(initialGlory + 1);
            });
        });

        describe('armor effect', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-youth', 'miya-mystic'],
                        hand: ['unwavering-devotion']
                    },
                    player2: {
                        inPlay: ['loyal-challenger', 'yogo-asami']
                    }
                });
                this.moto = this.player1.findCardByName('moto-youth');
                this.mystic = this.player1.findCardByName('miya-mystic');
                this.unwaveringDevotion = this.player1.findCardByName('unwavering-devotion');

                this.loyalChallenger = this.player2.findCardByName('loyal-challenger');
                this.yogoAsami = this.player2.findCardByName('yogo-asami');

                this.player1.playAttachment(this.unwaveringDevotion, this.moto);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.moto, this.mystic],
                    defenders: [this.loyalChallenger, this.yogoAsami]
                });
            });

            it('cannot be chosen for abilities of characters with lower glory', function () {
                this.player2.clickCard(this.loyalChallenger);
                expect(this.player2).toBeAbleToSelect(this.mystic);
                expect(this.player2).not.toBeAbleToSelect(this.moto);
            });

            it('can be chosen for abilities of characters with equal or higher glory', function () {
                this.player2.clickCard(this.yogoAsami);
                expect(this.player2).toBeAbleToSelect(this.mystic);
                expect(this.player2).toBeAbleToSelect(this.moto);
            });
        });
    });
});
