describe('Studious', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['venerable-historian', 'solemn-scholar', 'steward-of-law', 'doji-kuwanan'],
                    hand: ['studious']
                },
                player2: {
                    inPlay: ['scholar-of-old-rempet', 'bayushi-kachiko'],
                    hand: ['assassination']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.historian = this.player1.findCardByName('venerable-historian');
            this.solemnScholar = this.player1.findCardByName('solemn-scholar');
            this.steward = this.player1.findCardByName('steward-of-law');
            this.studious = this.player1.findCardByName('studious');
            this.assassination = this.player2.findCardByName('assassination');
            this.scholarOfOldRempet = this.player2.findCardByName('scholar-of-old-rempet');
            this.kachiko = this.player2.findCardByName('bayushi-kachiko');
        });

        it('should only attach to any scholar character', function () {
            this.player1.clickCard(this.studious);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).toBeAbleToSelect(this.historian);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            expect(this.player1).toBeAbleToSelect(this.steward);
            expect(this.player1).toBeAbleToSelect(this.scholarOfOldRempet);
        });

        it('should react on the character winning', function () {
            this.player1.clickCard(this.studious);
            this.player1.clickCard(this.historian);
            this.player2.pass();
            this.player1.pass();

            this.initialHandSize = this.player1.hand.length;
            this.initiateConflict({
                type: 'political',
                attackers: [this.historian],
                defenders: []
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.historian);

            this.player1.clickCard(this.historian);
            expect(this.getChatLogs(10)).toContain('player1 uses Venerable Historian\'s gained ability from Studious to draw 1 card');
            expect(this.player1.hand.length).toBe(this.initialHandSize + 1);
        });

        it('should not react on the character losing', function () {
            this.player1.clickCard(this.studious);
            this.player1.clickCard(this.historian);
            this.player2.pass();
            this.player1.pass();

            this.initiateConflict({
                type: 'political',
                attackers: [this.historian],
                defenders: [this.kachiko]
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.historian);

            this.player1.clickCard(this.historian);
            expect(this.getChatLogs(10)).not.toContain('player1 uses Venerable Historian\'s gained ability from Studious to draw 1 card');
        });

        it('should give attached character sincerity', function () {
            this.player1.clickCard(this.studious);
            this.player1.clickCard(this.historian);
            this.player2.pass();
            this.player1.pass();

            this.initialHandSize = this.player1.hand.length;
            this.initiateConflict({
                type: 'political',
                attackers: [this.historian],
                defenders: [this.kachiko]
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.historian);
            expect(this.getChatLogs(10)).toContain('player1 draws a card due to Venerable Historian\'s Sincerity');
            expect(this.player1.hand.length).toBe(this.initialHandSize + 1);
        });
    });
});
