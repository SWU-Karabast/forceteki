describe('Crane Industry', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger'],
                    hand: ['crane-industry', 'admit-defeat', 'i-can-swim', 'way-of-the-scorpion', 'i-can-swim']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-kuwanan'],
                    hand: ['a-fate-worse-than-death']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.industry = this.player1.findCardByName('crane-industry');
            this.defeat = this.player1.findCardByName('admit-defeat');
            this.swim = this.player1.filterCardsByName('i-can-swim')[0];
            this.swim2 = this.player1.filterCardsByName('i-can-swim')[1];
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.afwtd = this.player2.findCardByName('a-fate-worse-than-death');
            this.kuwanan.dishonor();
        });

        it('should react to the conflict starting', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.whisperer]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.industry);
        });

        it('should reduce costs of the first copy of each event you play', function() {
            this.player1.player.showBid = 5;
            this.player2.player.showBid = 1;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.whisperer, this.kuwanan]
            });
            this.player1.clickCard(this.industry);
            expect(this.getChatLogs(5)).toContain('player1 plays Crane Industry to reduce the cost of the first copy of each event they play this conflict by 1');

            let fate = this.player2.fate;
            this.player2.clickCard(this.afwtd);
            this.player2.clickCard(this.challenger);
            expect(this.player2.fate).toBe(fate - 4);

            fate = this.player1.fate;
            this.player1.clickCard(this.scorpion);
            this.player1.clickCard(this.whisperer);
            expect(this.player1.fate).toBe(fate);
            this.player2.pass();
            this.player1.clickCard(this.swim);
            this.player1.clickCard(this.whisperer);
            expect(this.player1.fate).toBe(fate - 1);
            this.player2.pass();
            this.player1.clickCard(this.defeat);
            this.player1.clickCard(this.kuwanan);
            expect(this.player1.fate).toBe(fate - 1);
            this.player2.pass();
            this.player1.clickCard(this.swim2);
            this.player1.clickCard(this.kuwanan);
            expect(this.player1.fate).toBe(fate - 3);
        });

        it('should reset limit in another conflict', function() {
            this.player1.player.showBid = 5;
            this.player2.player.showBid = 1;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.whisperer]
            });
            this.player1.clickCard(this.industry);
            expect(this.getChatLogs(5)).toContain('player1 plays Crane Industry to reduce the cost of the first copy of each event they play this conflict by 1');

            let fate = this.player2.fate;
            this.player2.clickCard(this.afwtd);
            this.player2.clickCard(this.challenger);

            fate = this.player1.fate;
            this.player1.clickCard(this.scorpion);
            this.player1.clickCard(this.whisperer);
            expect(this.player1.fate).toBe(fate);
            this.player2.pass();
            this.player1.clickCard(this.defeat);
            this.player1.clickCard(this.whisperer);
            expect(this.player1.fate).toBe(fate);
            this.player2.pass();
            this.player1.clickCard(this.swim);
            this.player1.clickCard(this.whisperer);
            expect(this.player1.fate).toBe(fate - 1);
            this.noMoreActions();
            this.player1.moveCard(this.industry, 'hand');

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: []
            });

            this.player1.clickCard(this.industry);
            expect(this.getChatLogs(5)).toContain('player1 plays Crane Industry to reduce the cost of the first copy of each event they play this conflict by 1');

            fate = this.player1.fate;

            this.player1.clickCard(this.swim2);
            this.player1.clickCard(this.kuwanan);
            expect(this.player1.fate).toBe(fate - 1);
        });
    });
});
