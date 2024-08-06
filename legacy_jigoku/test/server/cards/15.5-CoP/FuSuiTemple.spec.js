describe('Fu Sui Temple', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'kakita-toshimoko'],
                    dynastyDiscard: ['fu-sui-temple']
                },
                player2: {
                    inPlay: ['doji-challenger', 'miya-mystic']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
            this.mystic = this.player2.findCardByName('miya-mystic');

            this.temple = this.player1.findCardByName('fu-sui-temple');
            this.player1.placeCardInProvince(this.temple, 'province 1');
            this.temple.facedown = false;
        });

        it('should not give pride in military conflicts', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.toshimoko],
                defenders: [this.dojiChallenger],
                type: 'military'
            });

            expect(this.yoshi.hasKeyword('pride')).toBe(false);
            expect(this.toshimoko.hasKeyword('pride')).toBe(false);
            expect(this.dojiChallenger.hasKeyword('pride')).toBe(false);
            expect(this.mystic.hasKeyword('pride')).toBe(false);
        });

        it('should give pride to participating characters in political conflicts', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.toshimoko],
                defenders: [this.dojiChallenger],
                type: 'political'
            });

            expect(this.yoshi.hasKeyword('pride')).toBe(true);
            expect(this.toshimoko.hasKeyword('pride')).toBe(true);
            expect(this.dojiChallenger.hasKeyword('pride')).toBe(true);
            expect(this.mystic.hasKeyword('pride')).toBe(false);
        });
    });
});
