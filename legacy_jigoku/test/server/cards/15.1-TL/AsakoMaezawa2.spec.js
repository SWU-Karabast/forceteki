describe('Asako Maezawa 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['asako-maezawa-2', 'bayushi-manipulator']
                },
                player2: {
                    inPlay: ['bayushi-manipulator', 'adept-of-the-waves', 'bayushi-liar']
                }
            });

            this.liar = this.player2.findCardByName('bayushi-liar');
            this.liar.fate = 1;
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.asako = this.player1.findCardByName('asako-maezawa-2');
            this.manip2 = this.player2.findCardByName('bayushi-manipulator');
            this.adept = this.player2.findCardByName('adept-of-the-waves');
        });

        it('should allow you to bow a character with no fate after winning a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.asako],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.asako);
            expect(this.player1).toBeAbleToSelect(this.manip2);
            this.player1.clickCard(this.manip2);
            expect(this.getChatLogs(10)).toContain('player1 uses Asako Maezawa to bow Bayushi Manipulator');
            expect(this.manip2.bowed).toBe(true);
        });

        it('should allow you to dishonor a phoenix character', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.asako],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.asako);
            expect(this.player1).toBeAbleToSelect(this.adept);
            this.player1.clickCard(this.adept);
            expect(this.adept.isDishonored).toBe(true);
            expect(this.adept.bowed).toBe(true);
        });

        it('should not be allowed to bow a character with fate on it', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.asako],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.asako);
            expect(this.player1).not.toBeAbleToSelect(this.liar);
        });

        it('can\'t trigger at home', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });

        it('can target a bowed Phoenix character', function() {
            this.adept.bowed = true;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.asako],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.asako);
            expect(this.player1).toBeAbleToSelect(this.adept);
        });
    });
});
