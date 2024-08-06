describe('Battle Meditation', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['vice-proprietor', 'doji-kuwanan', 'bayushi-shoju', 'vanguard-warrior', 'adept-of-shadows'],
                    hand: ['duelist-training']
                },
                player2: {
                    inPlay: ['doji-hotaru-2', 'beloved-advisor'],
                    hand: ['battlefield-orders']
                }
            });

            this.vice = this.player1.findCardByName('vice-proprietor');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.shoju = this.player1.findCardByName('bayushi-shoju');
            this.warrior = this.player1.findCardByName('vanguard-warrior');
            this.adept = this.player1.findCardByName('adept-of-shadows');
            this.dt = this.player1.findCardByName('duelist-training');

            this.hotaru = this.player2.findCardByName('doji-hotaru-2');
            this.advisor = this.player2.findCardByName('beloved-advisor');
            this.orders = this.player2.findCardByName('battlefield-orders');

            this.vice.dishonor();
            this.hotaru.honor();
        });

        it('should not work outside of a conflict', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.orders);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not work in a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'political'
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.orders);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you choose someone with a valid ability', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.orders);
            expect(this.player2).toHavePrompt('Select an ability to resolve');
            expect(this.player2).not.toBeAbleToSelect(this.vice); //can't pay costs
            expect(this.player2).toBeAbleToSelect(this.kuwanan);
            expect(this.player2).not.toBeAbleToSelect(this.shoju); //fails triggering conditions
            expect(this.player2).toBeAbleToSelect(this.warrior);
            expect(this.player2).toBeAbleToSelect(this.adept);
            expect(this.player2).not.toBeAbleToSelect(this.hotaru); //not an action
            expect(this.player2).toBeAbleToSelect(this.advisor);
        });

        it('should let the characters controller resolve the ability', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.orders);
            expect(this.player2).toHavePrompt('Select an ability to resolve');
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.vice);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan); //same
            expect(this.player1).toBeAbleToSelect(this.shoju);
            expect(this.player1).toBeAbleToSelect(this.warrior);
            expect(this.player1).toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru); //higher
            expect(this.player1).toBeAbleToSelect(this.advisor);

            this.player1.clickCard(this.advisor);
            expect(this.advisor.bowed).toBe(true);

            expect(this.getChatLogs(10)).toContain('player2 plays Battlefield Orders to trigger Doji Kuwanan\'s \'Bow a participating character with lower military skill\' ability');
            expect(this.getChatLogs(10)).toContain('player1 resolves Doji Kuwanan to bow Beloved Advisor');
        });

        it('should let the characters controller resolve the ability', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'military'
            });

            let hand1 = this.player1.hand.length;
            let hand2 = this.player2.hand.length;

            this.player2.clickCard(this.orders);
            this.player2.clickCard(this.advisor);

            expect(this.player1.hand.length).toBe(hand1 + 1);
            expect(this.player2.hand.length).toBe(hand2); //-1 from orders

            expect(this.getChatLogs(10)).toContain('player2 plays Battlefield Orders to trigger Beloved Advisor\'s \'Each player draws 1 card\' ability');
            expect(this.getChatLogs(10)).toContain('player2 resolves Beloved Advisor to draw 1 card');
        });

        it('should let you choose between action if the character has multiple', function() {
            this.player1.playAttachment(this.dt, this.kuwanan);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.orders);
            this.player2.clickCard(this.kuwanan);

            expect(this.player2).toHavePromptButton('Bow a participating character with lower military skill');
            expect(this.player2).toHavePromptButton('Initiate a duel to bow');

            this.player2.clickPrompt('Initiate a duel to bow');
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.hotaru);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.kuwanan.bowed).toBe(true);
        });

        it('should not let you play if  there are no legal targets', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.hotaru],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.orders);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should force controller to pay costslet the characters controller resolve the ability', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.kuwanan, this.shoju, this.warrior, this.adept],
                defenders: [this.hotaru, this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.orders);
            let fate = this.kuwanan.fate;
            expect(this.player2).toHavePrompt('Select an ability to resolve');
            this.player2.clickCard(this.warrior);
            this.player1.clickCard(this.kuwanan);
            expect(this.warrior.location).toBe('dynasty discard pile');
            expect(this.kuwanan.fate).toBe(fate + 1);

            expect(this.getChatLogs(10)).toContain('player2 plays Battlefield Orders to trigger Vanguard Warrior\'s \'Sacrifice to put fate on one character\' ability');
            expect(this.getChatLogs(10)).toContain('player1 resolves Vanguard Warrior, sacrificing Vanguard Warrior to place 1 fate on Doji Kuwanan');
        });
    });
});
