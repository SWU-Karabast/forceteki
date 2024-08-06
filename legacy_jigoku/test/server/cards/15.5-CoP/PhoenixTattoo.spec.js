describe('Phoenix Tattoo', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'kakita-toshimoko'],
                    hand: ['phoenix-tattoo']
                },
                player2: {
                    inPlay: ['doji-challenger', 'miya-mystic']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
            this.mystic = this.player2.findCardByName('miya-mystic');
            this.phoenix = this.player1.findCardByName('phoenix-tattoo');
        });

        it('should only attach to a character you control', function() {
            this.player1.clickCard(this.phoenix);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.dojiChallenger);
            expect(this.player1).not.toBeAbleToSelect(this.mystic);
        });

        it('should not give pride if character is not participating', function() {
            this.player1.playAttachment(this.phoenix, this.toshimoko);
            expect(this.toshimoko.hasTrait('tattooed')).toBe(true);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiChallenger],
                type: 'military'
            });

            expect(this.yoshi.hasKeyword('pride')).toBe(false);
            expect(this.toshimoko.hasKeyword('pride')).toBe(false);
            expect(this.dojiChallenger.hasKeyword('pride')).toBe(false);
            expect(this.mystic.hasKeyword('pride')).toBe(false);
        });

        it('should give pride to other participating characters - pol', function() {
            this.player1.playAttachment(this.phoenix, this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.toshimoko],
                defenders: [this.dojiChallenger],
                type: 'political'
            });

            expect(this.yoshi.hasKeyword('pride')).toBe(true);
            expect(this.toshimoko.hasKeyword('pride')).toBe(false);
            expect(this.dojiChallenger.hasKeyword('pride')).toBe(true);
            expect(this.mystic.hasKeyword('pride')).toBe(false);
        });

        it('should give pride to other participating characters - mil', function() {
            this.player1.playAttachment(this.phoenix, this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.toshimoko],
                defenders: [this.dojiChallenger],
                type: 'military'
            });

            expect(this.yoshi.hasKeyword('pride')).toBe(true);
            expect(this.toshimoko.hasKeyword('pride')).toBe(false);
            expect(this.dojiChallenger.hasKeyword('pride')).toBe(true);
            expect(this.mystic.hasKeyword('pride')).toBe(false);
        });
    });
});
