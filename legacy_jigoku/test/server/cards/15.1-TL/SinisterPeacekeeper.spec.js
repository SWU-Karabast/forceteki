describe('Sinister Peacekeeper', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['chronicler-of-conquests'],
                    hand: ['total-warfare', 'way-with-words'],
                    dynastyDiscard: ['borderlands-fortifications'],
                    provinces: ['dishonorable-assault']
                },
                player2: {
                    inPlay: ['sinister-peacekeeper'],
                    hand: ['assassination', 'justicar-s-approach'],
                    provinces: ['fertile-fields']
                }
            });

            this.chronicler = this.player1.findCardByName('chronicler-of-conquests');
            this.assault = this.player1.findCardByName('dishonorable-assault');
            this.fortification = this.player1.findCardByName('borderlands-fortifications');
            this.words = this.player1.findCardByName('way-with-words');
            this.chronicler.honor();

            this.fields = this.player2.findCardByName('fertile-fields');
            this.sinister = this.player2.findCardByName('sinister-peacekeeper');
            this.totalWarfare = this.player1.findCardByName('total-warfare');
            this.assassination = this.player2.findCardByName('assassination');
            this.approach = this.player2.findCardByName('justicar-s-approach');

        });

        it('should be useable when opponent gains honor through a card effect', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.pass();
            this.player1.playAttachment(this.totalWarfare, this.fields);
            this.player2.pass();
            this.player1.clickCard(this.chronicler);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
            this.player2.clickCard(this.sinister);
            expect(this.getChatLogs(10)).toContain('player2 uses Sinister Peacekeeper to make player1 lose 1 honor');
        });

        it('should trigger off of the air ring being won by opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
        });

        it('should be able to be used when an honored character leaves play', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.chronicler);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
        });

        it('should trigger off of the air ring being won by opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Take 1 Honor from opponent');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
        });

        it('should trigger when an opponent steals an honor via card effect', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'fire',
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.words);
            this.player1.clickCard(this.chronicler);
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.chronicler);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
        });

        it('should trigger when you transfer honor via bids', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'fire',
                attackers: [this.chronicler],
                defenders: [this.sinister]
            });
            this.player2.clickCard(this.approach);
            this.player2.clickCard(this.sinister);
            this.player1.pass();
            this.player2.clickCard(this.sinister);
            this.player2.clickCard(this.chronicler);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('5');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sinister);
        });
    });
});
