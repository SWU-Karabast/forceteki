describe('Butcher of the Fallen', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['soshi-aoi', 'palace-guard', 'bayushi-liar', 'keeper-initiate'],
                    hand: ['suffer-the-consequences']
                },
                player2: {
                    inPlay: ['matsu-berserker']
                }
            });

            this.shugenja = this.player1.findCardByName('soshi-aoi');
            this.bushi = this.player1.findCardByName('palace-guard');
            this.courtier = this.player1.findCardByName('bayushi-liar');
            this.monk = this.player1.findCardByName('keeper-initiate');
            this.suffer = this.player1.findCardByName('suffer-the-consequences');

            this.bushiP2 = this.player2.findCardByName('matsu-berserker');
        });

        it('should only allow you to pay with bowed characters', function() {
            this.monk.bowed = true;
            this.bushi.bowed = true;

            this.player1.clickCard(this.suffer);

            expect(this.player1).toBeAbleToSelect(this.bushi);
            expect(this.player1).not.toBeAbleToSelect(this.shugenja);
            expect(this.player1).not.toBeAbleToSelect(this.monk);
            expect(this.player1).not.toBeAbleToSelect(this.courtier);
        });

        it('should only count shugenja, courtier or bushi characters', function() {
            this.monk.bowed = true;
            this.bushi.bowed = true;
            this.courtier.bowed = true;
            this.shugenja.bowed = true;

            this.player1.clickCard(this.suffer);

            expect(this.player1).toBeAbleToSelect(this.bushi);
            expect(this.player1).toBeAbleToSelect(this.shugenja);
            expect(this.player1).not.toBeAbleToSelect(this.monk);
            expect(this.player1).toBeAbleToSelect(this.courtier);
        });

        it('should grant you an additional political conflict', function() {
            this.monk.bowed = true;
            this.bushi.bowed = true;
            this.courtier.bowed = true;
            this.shugenja.bowed = true;

            this.player1.clickCard(this.suffer);
            this.player1.clickCard(this.bushi);

            expect(this.bushi.location).toBe('dynasty discard pile');
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('political')).toBe(2);
        });
    });
});
