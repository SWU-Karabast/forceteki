describe('Iuchi Shahai 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['iuchi-shahai-2', 'doji-challenger'],
                    hand: ['talisman-of-the-sun', 'shadow-steed', 'fine-katana']
                },
                player2: {
                    inPlay: ['iuchi-shahai-2', 'ikoma-ikehata']
                }
            });
            this.shahai = this.player1.findCardByName('iuchi-shahai-2');
            this.talisman = this.player1.findCardByName('talisman-of-the-sun');
            this.shadowSteed = this.player1.findCardByName('shadow-steed');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.katana = this.player1.findCardByName('fine-katana');

            this.challenger.fate = 10;

            this.shahaiP2 = this.player2.findCardByName('iuchi-shahai-2');
            this.ikehata = this.player2.findCardByName('ikoma-ikehata');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
        });

        it('should have covert as first player', function() {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.province);
            this.player1.clickCard(this.shahai);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
            expect(this.player1).toBeAbleToSelect(this.shahaiP2);
            expect(this.player1).not.toBeAbleToSelect(this.ikehata);
        });

        it('should react to playing a meishodo card', function() {
            let fate = this.shahai.fate;
            let honor = this.player1.honor;
            this.player1.playAttachment(this.talisman, this.challenger);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shahai);
            this.player1.clickCard(this.shahai);
            expect(this.shahai.fate).toBe(fate + 1);
            expect(this.player1.honor).toBe(honor - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Iuchi Shahai, losing 1 honor to place 1 fate on Iuchi Shahai');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should react to playing a maho card', function() {
            let fate = this.shahai.fate;
            this.player1.playAttachment(this.shadowSteed, this.challenger);
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shahai);
            this.player1.clickCard(this.shahai);
            expect(this.shahai.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Iuchi Shahai, losing 1 honor to place 1 fate on Iuchi Shahai');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not react to playing a normal card', function() {
            this.player1.playAttachment(this.katana, this.challenger);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
