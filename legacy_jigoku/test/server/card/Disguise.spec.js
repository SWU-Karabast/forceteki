describe('Disguise', function () {
    integration(function () {
        describe('Non-Conflict Phase', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['doji-whisperer', 'brash-samurai'],
                        dynastyDiscard: ['daidoji-kageyu'],
                        fate: 7
                    }
                });

                this.player1.player.promptedActionWindows.draw = true;
                this.player2.player.promptedActionWindows.draw = true;
                this.kageyu = this.player1.findCardByName('daidoji-kageyu');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.brash = this.player1.findCardByName('brash-samurai');
                this.player1.moveCard(this.kageyu, 'province 1');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should not be playable using disguised', function () {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.kageyu);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });

        describe('Conflict Phase', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-whisperer', 'brash-samurai', 'dazzling-duelist'],
                        hand: ['a-new-name', 'seal-of-the-crane', 'iaijutsu-master'],
                        dynastyDiscard: ['daidoji-kageyu'],
                        fate: 7
                    }
                });

                this.newName = this.player1.findCardByName('a-new-name');
                this.seal = this.player1.findCardByName('seal-of-the-crane');
                this.master = this.player1.findCardByName('iaijutsu-master');
                this.kageyu = this.player1.findCardByName('daidoji-kageyu');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.brash = this.player1.findCardByName('brash-samurai');
                this.dazzling = this.player1.findCardByName('dazzling-duelist');
                this.player1.moveCard(this.kageyu, 'province 1');
            });

            it('should be playable using disguised, targeting a character with the correct trait', function () {
                this.player1.clickCard(this.kageyu);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.brash);
            });

            it('should cost fate equal to the difference and discard the character', function () {
                let fate = this.player1.fate;
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.whisperer);
                expect(this.player1.fate).toBe(fate - 2);
                expect(this.kageyu.location).toBe('play area');
                expect(this.whisperer.location).toBe('dynasty discard pile');
            });

            it('should work with gained keywords', function () {
                this.player1.playAttachment(this.newName, this.brash);
                this.player2.pass();
                this.player1.clickCard(this.kageyu);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).toBeAbleToSelect(this.brash);
            });

            it('should transfer attachments', function () {
                this.player1.playAttachment(this.newName, this.brash);
                this.player2.pass();
                let fate = this.player1.fate;
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.brash);
                expect(this.player1.fate).toBe(fate - 1);
                expect(this.kageyu.location).toBe('play area');
                expect(this.brash.location).toBe('dynasty discard pile');
                expect(this.kageyu.attachments).toContain(this.newName);
            });

            it('should transfer fate', function () {
                this.whisperer.fate = 1;
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.whisperer);
                expect(this.kageyu.fate).toBe(1);
            });

            it('should transfer status tokens', function () {
                this.whisperer.honor();
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.whisperer);
                expect(this.kageyu.isHonored).toBe(true);
            });

            it('should transfer multiple status tokens', function () {
                this.whisperer.honor();
                this.whisperer.taint();
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.whisperer);
                expect(this.kageyu.isHonored).toBe(true);
                expect(this.kageyu.isTainted).toBe(true);
            });

            it('should transfer attachments that are keyword dependent if the keyword is gained from another attachment', function () {
                this.player1.playAttachment(this.newName, this.brash);
                this.player2.pass();
                this.player1.playAttachment(this.seal, this.brash);
                this.player2.pass();
                this.player1.playAttachment(this.master, this.brash);
                this.player2.pass();
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.brash);
                expect(this.kageyu.location).toBe('play area');
                expect(this.brash.location).toBe('dynasty discard pile');
                expect(this.kageyu.attachments).toContain(this.newName);
                expect(this.kageyu.attachments).toContain(this.seal);
                expect(this.kageyu.attachments).toContain(this.master);
            });

            it('should discard newly illegal attachments', function () {
                this.player1.playAttachment(this.newName, this.dazzling);
                this.player2.pass();
                this.player1.playAttachment(this.master, this.dazzling);
                this.player2.pass();
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.dazzling);
                expect(this.kageyu.location).toBe('play area');
                expect(this.dazzling.location).toBe('dynasty discard pile');
                expect(this.kageyu.attachments).toContain(this.newName);
                expect(this.kageyu.attachments).not.toContain(this.master);
                expect(this.getChatLogs(3)).toContain(
                    'Iaijutsu Master is discarded from Daidoji Kageyu as it is no longer legally attached'
                );
            });
        });
    });
});
