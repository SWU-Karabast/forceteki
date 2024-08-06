describe('Silent Enforcer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['silent-enforcer', 'iuchi-wayfinder'],
                    hand: ['way-of-the-scorpion', 'fine-katana']
                },
                player2: {
                    inPlay: ['borderlands-defender', 'doji-whisperer', 'doji-kuwanan'],
                    hand: ['way-of-the-crane']
                }
            });

            this.enforcer = this.player1.findCardByName('silent-enforcer');
            this.wayfinder = this.player1.findCardByName('iuchi-wayfinder');
            this.defender = this.player2.findCardByName('borderlands-defender');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');

            this.scorp = this.player1.findCardByName('way-of-the-scorpion');
            this.katana = this.player1.findCardByName('fine-katana');
            this.crane = this.player2.findCardByName('way-of-the-crane');
        });

        it('should react to playing an event', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer, this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.scorp);
            this.player1.clickCard(this.defender);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.enforcer);
        });

        it('should not react to playing a non-event', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer, this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.defender);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not react to opponent playing an event', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer, this.kuwanan]
            });
            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not be able to be triggered if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer]
            });
            this.player2.pass();
            this.player1.clickCard(this.scorp);
            this.player1.clickCard(this.defender);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you choose a valid participating character that costs 3 or less', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer, this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.scorp);
            this.player1.clickCard(this.defender);
            this.player1.clickCard(this.enforcer);
            expect(this.player1).toBeAbleToSelect(this.enforcer);
            expect(this.player1).not.toBeAbleToSelect(this.defender);
            expect(this.player1).not.toBeAbleToSelect(this.wayfinder);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).toHavePromptButton('Move this character home');
            expect(this.player2).toHavePromptButton('Bow this character');
        });

        it('send home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer]
            });
            this.player2.pass();
            this.player1.clickCard(this.scorp);
            this.player1.clickCard(this.defender);
            this.player1.clickCard(this.enforcer);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Move this character home');
            expect(this.whisperer.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Silent Enforcer to send Doji Whisperer home');
        });

        it('bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.enforcer],
                defenders: [this.defender, this.whisperer]
            });
            this.player2.pass();
            this.player1.clickCard(this.scorp);
            this.player1.clickCard(this.defender);
            this.player1.clickCard(this.enforcer);
            this.player1.clickCard(this.enforcer);

            expect(this.player1).toHavePromptButton('Move this character home');
            expect(this.player1).toHavePromptButton('Bow this character');
            this.player1.clickPrompt('Bow this character');
            expect(this.enforcer.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Silent Enforcer to bow Silent Enforcer');
        });
    });
});
