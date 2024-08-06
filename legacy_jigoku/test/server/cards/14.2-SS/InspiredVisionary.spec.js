describe('Inspired Visionary', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['inspired-visionary', 'doji-kuwanan'],
                    hand: ['fine-katana']
                },
                player2: {
                    inPlay: ['kakita-toshimoko'],
                    hand: ['finger-of-jade', 'pacifism', 'calling-in-favors']
                }
            });

            this.visionary = this.player1.findCardByName('inspired-visionary');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.katana = this.player1.findCardByName('fine-katana');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.pacifism = this.player2.findCardByName('pacifism');
            this.cif = this.player2.findCardByName('calling-in-favors');

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
        });

        it('should not react when there are no attachments', function() {
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should allow bowing to shuffle an attachment back into the deck and have the owner draw a card', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.pass();
            this.player2.playAttachment(this.pacifism, this.kuwanan);

            let hand1 = this.player1.hand.length;
            let hand2 = this.player2.hand.length;

            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.visionary);
            this.player1.clickCard(this.visionary);

            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.jade);
            expect(this.player1).toBeAbleToSelect(this.pacifism);
            this.player1.clickCard(this.pacifism);
            expect(this.visionary.bowed).toBe(true);
            expect(this.pacifism.location === 'conflict deck' || this.pacifism.location === 'hand').toBe(true);

            expect(this.player1.hand.length).toBe(hand1);
            expect(this.player2.hand.length).toBe(hand2 + 1);

            expect(this.getChatLogs(3)).toContain('player1 uses Inspired Visionary, bowing Inspired Visionary to shuffle Pacifism into its owner\'s deck');
            expect(this.getChatLogs(3)).toContain('player2 is shuffling their conflict deck');
        });


        it('should allow bowing to shuffle an attachment back into the deck and have the owner draw a card (switching owner)', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.pass();
            this.player2.playAttachment(this.pacifism, this.kuwanan);
            this.player1.pass();
            this.player2.clickCard(this.cif);
            this.player2.clickCard(this.katana);
            this.player2.clickCard(this.toshimoko);

            let hand1 = this.player1.hand.length;
            let hand2 = this.player2.hand.length;

            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.visionary);
            this.player1.clickCard(this.visionary);
            expect(this.player1).toBeAbleToSelect(this.katana);
            this.player1.clickCard(this.katana);
            expect(this.visionary.bowed).toBe(true);
            expect(this.katana.location === 'conflict deck' || this.katana.location === 'hand').toBe(true);

            expect(this.player1.hand.length).toBe(hand1 + 1);
            expect(this.player2.hand.length).toBe(hand2);

            expect(this.getChatLogs(3)).toContain('player1 uses Inspired Visionary, bowing Inspired Visionary to shuffle Fine Katana into its owner\'s deck');
            expect(this.getChatLogs(3)).toContain('player1 is shuffling their conflict deck');
        });

        it('should not work if the character is bowed', function() {
            this.visionary.bowed = true;
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.pass();
            this.player2.playAttachment(this.pacifism, this.kuwanan);

            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
