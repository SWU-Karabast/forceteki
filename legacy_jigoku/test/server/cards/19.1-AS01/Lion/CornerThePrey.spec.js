describe('Corner the Prey', function () {
    integration(function () {
        describe('Corner the Prey action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 500,
                        inPlay: ['doji-challenger', 'doji-whisperer', 'ikoma-message-runner'],
                        hand: ['corner-the-prey', 'fine-katana', 'ayubune-pilot', 'dutiful-assistant']
                    },
                    player2: {
                        inPlay: ['solemn-scholar', 'agasha-prodigy', 'akodo-makoto', 'akodo-kage', 'akodo-cho']
                    }
                });

                this.challenger = this.player1.findCardByName('doji-challenger');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.whisperer = this.player1.findCardByName('doji-whisperer');

                this.cornerThePrey = this.player1.findCardByName('corner-the-prey');
                this.ayubunePilot = this.player1.findCardByName('ayubune-pilot');
                this.fineKatana = this.player1.findCardByName('fine-katana');
                this.assistant = this.player1.findCardByName('dutiful-assistant');

                this.solemnScholar = this.player2.findCardByName('solemn-scholar');
                this.agashaProdigy = this.player2.findCardByName('agasha-prodigy');
                this.akodoMakoto = this.player2.findCardByName('akodo-makoto');
                this.akodoKage = this.player2.findCardByName('akodo-kage');
                this.akodoCho = this.player2.findCardByName('akodo-cho');

                this.player1.playAttachment(this.fineKatana, this.messageRunner);
                this.player2.pass();
                this.player1.playAttachment(this.ayubunePilot, this.messageRunner);
                this.player2.pass();
                this.player1.playAttachment(this.assistant, this.whisperer);
            });

            it('should not be playable with no participating follower cards', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.challenger],
                    defenders: [this.solemnScholar, this.agashaProdigy, this.akodoMakoto, this.akodoKage, this.akodoCho]
                });

                this.player2.pass();
                this.player1.clickCard(this.cornerThePrey);

                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should prompt you to sacrifice followers', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.messageRunner],
                    defenders: [this.solemnScholar, this.agashaProdigy, this.akodoMakoto, this.akodoKage, this.akodoCho]
                });

                this.player2.pass();
                this.player1.clickCard(this.cornerThePrey);

                expect(this.player1).toHavePrompt('Select card to sacrifice');
                expect(this.player1).toBeAbleToSelect(this.ayubunePilot);
                expect(this.player1).not.toBeAbleToSelect(this.fineKatana);
                expect(this.player1).not.toBeAbleToSelect(this.assistant);
                expect(this.player1).not.toHavePromptButton('Done');
            });

            it('should prompt you to choose a participating character with printed cost less than # of sacrificed and discard it', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.messageRunner],
                    defenders: [this.solemnScholar, this.agashaProdigy, this.akodoMakoto, this.akodoKage, this.akodoCho]
                });

                this.player2.pass();
                this.player1.clickCard(this.cornerThePrey);
                this.player1.clickCard(this.ayubunePilot);
                this.player1.clickPrompt('Done');

                expect(this.player1).toHavePrompt('Choose a character');

                expect(this.player1).toBeAbleToSelect(this.messageRunner);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                expect(this.player1).toBeAbleToSelect(this.solemnScholar);
                expect(this.player1).not.toBeAbleToSelect(this.agashaProdigy);
                expect(this.player1).not.toBeAbleToSelect(this.akodoMakoto);
                expect(this.player1).not.toBeAbleToSelect(this.akodoKage);
                expect(this.player1).not.toBeAbleToSelect(this.akodoCho);

                this.player1.clickCard(this.solemnScholar);
                expect(this.solemnScholar.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain('player1 plays Corner the Prey, sacrificing Ayubune Pilot to discard Solemn Scholar');
            });

            it('should let you sacrifice multiple followers', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.messageRunner, this.whisperer],
                    defenders: [this.solemnScholar, this.agashaProdigy, this.akodoMakoto, this.akodoKage, this.akodoCho]
                });

                this.player2.pass();
                this.player1.clickCard(this.cornerThePrey);
                this.player1.clickCard(this.ayubunePilot);
                this.player1.clickCard(this.assistant);
                this.player1.clickPrompt('Done');

                expect(this.player1).toHavePrompt('Choose a character');

                expect(this.player1).toBeAbleToSelect(this.solemnScholar);
                expect(this.player1).toBeAbleToSelect(this.agashaProdigy);
                expect(this.player1).not.toBeAbleToSelect(this.akodoMakoto);
                expect(this.player1).not.toBeAbleToSelect(this.akodoKage);
                expect(this.player1).not.toBeAbleToSelect(this.akodoCho);

                this.player1.clickCard(this.solemnScholar);
                expect(this.solemnScholar.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain('player1 plays Corner the Prey, sacrificing Ayubune Pilot and Dutiful Assistant to discard Solemn Scholar');
            });
        });
    });
});
