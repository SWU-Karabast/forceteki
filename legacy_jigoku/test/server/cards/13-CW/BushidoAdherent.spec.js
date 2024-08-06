describe('Bushido Adherent', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bushido-adherent', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator']
                }
            });
            this.adherent = this.player1.findCardByName('bushido-adherent');
            this.whisperer = this.player1.findCardByName('doji-whisperer');

            this.liar = this.player2.findCardByName('bayushi-liar');
            this.manipulator = this.player2.findCardByName('bayushi-manipulator');

            this.noMoreActions();
        });

        it('should allow choosing a participating character', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.adherent, this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();
            this.player1.clickCard(this.adherent);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.adherent);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.liar);
        });

        it('should not allow choosing a character that is already honored', function() {
            this.whisperer.honor();
            this.initiateConflict({
                type: 'military',
                attackers: [this.adherent, this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();
            this.player1.clickCard(this.adherent);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.adherent);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.liar);
        });

        it('should honor chosen character and opponent should draw 1 card', function() {
            let hand = this.player2.hand.length;

            this.initiateConflict({
                type: 'military',
                attackers: [this.adherent, this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();
            this.player1.clickCard(this.adherent);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.adherent);
            expect(this.adherent.isHonored).toBe(true);
            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(3)).toContain('player1 uses Bushidō Adherent to honor Bushidō Adherent and have player2 draw 1 card');
        });

        it('should not trigger if not participating', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.adherent);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
