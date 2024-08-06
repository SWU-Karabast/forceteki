describe('Command the Tributary', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['damned-hida', 'doji-challenger'],
                    hand: ['command-the-tributary']
                },
                player2:{
                    inPlay: ['damned-hida']
                }
            });

            this.hida = this.player1.findCardByName('damned-hida');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.challenger.fate = 1;
            this.tributary = this.player1.findCardByName('command-the-tributary');

            this.hida2 = this.player2.findCardByName('damned-hida');
            this.hida2.fate = 1;

            this.player1.playAttachment('command-the-tributary', this.challenger);
            this.player2.pass();
        });


        it('should let you transfer fate from your character to another character', function() {
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.hida);
            expect(this.player1).toBeAbleToSelect(this.hida2);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.hida);
            expect(this.hida.fate).toBe(1);
            expect(this.challenger.fate).toBe(0);
            expect(this.getChatLogs(3)).toContain('player1 uses Doji Challenger\'s gained ability from Command the Tributary to place 1 fate on Damned Hida');
        });

        it('should be able to be used to transfer fate to any character', function() {
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.hida2);
            expect(this.hida2.fate).toBe(2);
            expect(this.challenger.fate).toBe(0);
        });

        it('should not be useable when the character has 0 fate', function() {
            this.challenger.fate = 0;
            this.player1.clickCard(this.challenger);
            expect(this.player1).not.toHavePrompt('Choose a character');
        });

    });
});
