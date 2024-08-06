describe('Blessed By Fukurokujin', function() {
    integration(function() {
        describe('Blessed By Fukurokujin\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shiba-tsukune', 'hantei-sotorii'],
                        hand: ['blessed-by-fukurokujin', 'blessed-by-fukurokujin']
                    },
                    player2: {
                        inPlay: ['bayushi-shoju'],
                        hand: ['for-shame','way-of-the-scorpion']
                    }
                });
                this.tsukune = this.player1.findCardByName('shiba-tsukune');
                this.sotorii = this.player1.findCardByName('hantei-sotorii');
                this.blessed = this.player1.filterCardsByName('blessed-by-fukurokujin')[0];
                this.blessed2 = this.player1.filterCardsByName('blessed-by-fukurokujin')[1];

                this.forshame = this.player2.findCardByName('for-shame');
                this.wots = this.player2.findCardByName('way-of-the-scorpion');
                this.shoju = this.player2.findCardByName('bayushi-shoju');

                this.player1.clickCard(this.blessed);
                this.player1.clickCard(this.tsukune);
                this.player2.pass();
                this.player1.clickCard(this.blessed2);
                this.player1.clickCard(this.sotorii);
                this.noMoreActions();
            });

            it('it should prevent being dishonored', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: ['shiba-tsukune'],
                    defenders: ['bayushi-shoju']
                });
                this.player2.clickCard(this.wots);
                expect(this.player2).not.toHavePrompt('Choose a target');
            });

            it('it should force bow if forshamed', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: ['shiba-tsukune'],
                    defenders: ['bayushi-shoju']
                });
                this.player2.clickCard(this.forshame);
                this.player2.clickCard(this.tsukune);
                expect(this.tsukune.bowed).toBe(true);
            });

            it('it should allow going from honored to normal', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: ['shiba-tsukune'],
                    defenders: ['bayushi-shoju']
                });
                this.tsukune.honor();
                expect(this.tsukune.isHonored).toBe(true);
                this.player2.clickCard(this.wots);
                expect(this.player2).toBeAbleToSelect(this.tsukune);
                this.player2.clickCard(this.tsukune);
                expect(this.tsukune.isHonored).toBe(false);
            });

            it('it should prevent Pride from dishonoring if attached character loses a conflict', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.sotorii],
                    defenders: ['bayushi-shoju']
                });
                this.player2.pass();
                this.player1.pass();
                expect(this.sotorii.isHonored).toBe(false);
                expect(this.sotorii.isDishonored).toBe(false);
            });
        });
    });
});
