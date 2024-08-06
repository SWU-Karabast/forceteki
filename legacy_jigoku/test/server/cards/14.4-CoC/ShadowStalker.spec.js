describe('Shadow Stalker', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 6,
                    inPlay: ['shadow-stalker', 'tranquil-philosopher'],
                    hand: ['backhanded-compliment']
                },
                player2: {
                    honor: 7,
                    inPlay: ['shadow-stalker']
                }
            });

            this.stalker1 = this.player1.findCardByName('shadow-stalker');
            this.stalker2 = this.player2.findCardByName('shadow-stalker');
            this.philosopher = this.player1.findCardByName('tranquil-philosopher');
            this.bhc = this.player1.findCardByName('backhanded-compliment');
        });


        it('should get +2/+2 if you\'re at 6 honor', function() {
            expect(this.stalker1.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill + 2);
            expect(this.stalker1.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill + 2);
        });

        it('should not get +2/+2 if you\'re above 6 honor', function() {
            expect(this.stalker2.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill);
            expect(this.stalker2.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill);
        });

        it('should gain +2/+2 if you drop to 6 honor', function() {
            expect(this.stalker2.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill);
            expect(this.stalker2.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill);

            this.player1.clickCard(this.bhc);
            this.player1.clickPrompt('player2');

            expect(this.stalker2.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill + 2);
            expect(this.stalker2.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill + 2);
        });

        it('should lose +2/+2 if you go above 6 honor', function() {
            expect(this.stalker1.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill + 2);
            expect(this.stalker1.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill + 2);

            this.player1.clickCard(this.philosopher);
            this.player1.clickRing('air');

            expect(this.stalker1.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill);
            expect(this.stalker1.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill);
        });

        it('should keep +2/+2 if you go below 6 honor', function() {
            expect(this.stalker1.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill + 2);
            expect(this.stalker1.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill + 2);

            this.player1.clickCard(this.bhc);
            this.player1.clickPrompt('player1');

            expect(this.stalker1.getMilitarySkill()).toBe(this.stalker1.printedMilitarySkill + 2);
            expect(this.stalker1.getPoliticalSkill()).toBe(this.stalker1.printedPoliticalSkill + 2);
        });
    });
});
