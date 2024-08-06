describe('Jade Strike', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves', 'doji-whisperer'],
                    hand: ['jade-strike']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'isawa-ujina'],
                    hand: ['assassination']
                }
            });
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.strike = this.player1.findCardByName('jade-strike');
            this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.ujina = this.player2.findCardByName('isawa-ujina');
            this.assassination = this.player2.findCardByName('assassination');

            this.whisperer.taint();
            this.whisperer.fate = 3;
            this.raitsugu.honor();
            this.ujina.honor();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.adept, this.whisperer],
                defenders: [this.raitsugu]
            });
        });

        it('should let you choose a character with a status token', function() {
            this.player2.pass();
            this.player1.clickCard(this.strike);
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.raitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.ujina);
        });

        it('should set the chosen characters base skills to 0', function() {
            this.player2.pass();
            this.player1.clickCard(this.strike);
            this.player1.clickCard(this.raitsugu);
            expect(this.raitsugu.getMilitarySkill()).toBe(this.raitsugu.glory);
            expect(this.raitsugu.getPoliticalSkill()).toBe(this.raitsugu.glory);
            expect(this.raitsugu.getBaseMilitarySkill()).toBe(0);
            expect(this.raitsugu.getBasePoliticalSkill()).toBe(0);
            expect(this.getChatLogs(5)).toContain('player1 plays Jade Strike to set the base skills of Mirumoto Raitsugu to 0military/0political');
        });

        it('should also remove a fate if the chosen character is tainted', function() {
            let fate = this.whisperer.fate;
            this.player2.pass();
            this.player1.clickCard(this.strike);
            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.getBaseMilitarySkill()).toBe(0);
            expect(this.whisperer.getBasePoliticalSkill()).toBe(0);
            expect(this.whisperer.fate).toBe(fate - 1);
            expect(this.getChatLogs(5)).toContain('player1 plays Jade Strike to remove a fate from and set the base skills of Doji Whisperer to 0military/0political');
        });
    });
});
