describe('Scavenging Goblin', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['scavenging-goblin', 'doji-whisperer'],
                    hand: ['fine-katana']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni', 'ancient-master', 'ancient-master', 'ancient-master'],
                    hand: ['fine-katana', 'fine-katana', 'fine-katana', 'fine-katana', 'ornate-fan'],
                    conflictDiscard: ['voice-of-honor', 'assassination', 'charge']
                }
            });
            this.goblin = this.player1.findCardByName('scavenging-goblin');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');

            this.katana1 = this.player1.findCardByName('fine-katana');
            this.katana2 = this.player2.filterCardsByName('fine-katana')[0];
            this.katana3 = this.player2.filterCardsByName('fine-katana')[1];
            this.katana4 = this.player2.filterCardsByName('fine-katana')[2];
            this.fan = this.player2.findCardByName('ornate-fan');

            this.am1 = this.player2.filterCardsByName('ancient-master')[0];
            this.am2 = this.player2.filterCardsByName('ancient-master')[1];
            this.am3 = this.player2.filterCardsByName('ancient-master')[2];

            this.voice = this.player2.findCardByName('voice-of-honor');
            this.assassination = this.player2.findCardByName('assassination');
            this.charge = this.player2.findCardByName('charge');

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.player2.moveCard(this.voice, 'conflict deck');
            this.player2.moveCard(this.assassination, 'conflict deck');
            this.player2.moveCard(this.charge, 'conflict deck');
            this.player2.moveCard(this.am1, 'hand');

            this.player1.playAttachment(this.katana1, this.whisperer);
            this.player2.playAttachment(this.katana2, this.daidojiUji);
            this.player1.pass();
            this.player2.playAttachment(this.katana3, this.whisperer);
            this.player1.pass();
            this.player2.clickCard(this.am1);
            this.player2.clickPrompt('Play Ancient Master as an attachment');
            this.player2.clickCard(this.maraudingOni);

            this.noMoreActions();
        });

        it('should remove cards from your opponents conflict deck after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.goblin);
            this.player1.clickCard(this.goblin);
            expect(this.voice.location).toBe('removed from game');
            expect(this.charge.location).toBe('removed from game');
            expect(this.assassination.location).toBe('removed from game');

            expect(this.katana2.location).toBe('play area');
            expect(this.katana3.location).toBe('play area');
            expect(this.katana4.location).toBe('hand');

            expect(this.katana1.location).toBe('play area');
            expect(this.am1.location).toBe('play area');
            expect(this.am2.location).toBe('play area');

            expect(this.getChatLogs(5)).toContain('player1 uses Scavenging Goblin to remove the top 3 cards of player2\'s conflict deck from the game as well as any matching attachments');
            expect(this.getChatLogs(5)).toContain('Charge!, Assassination and Voice of Honor are removed from the game from the top of player2\'s conflict deck');
        });

        it('should remove attachments from play that your opponent controls that match a name (1 attachment)', function () {
            this.player2.moveCard(this.katana4, 'conflict deck');
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.goblin);
            this.player1.clickCard(this.goblin);
            expect(this.voice.location).toBe('conflict deck');
            expect(this.charge.location).toBe('removed from game');
            expect(this.assassination.location).toBe('removed from game');
            expect(this.katana2.location).toBe('removed from game');
            expect(this.katana3.location).toBe('removed from game');
            expect(this.katana4.location).toBe('removed from game');

            expect(this.katana1.location).toBe('play area');
            expect(this.am1.location).toBe('play area');
            expect(this.am2.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain('player1 uses Scavenging Goblin to remove the top 3 cards of player2\'s conflict deck from the game as well as any matching attachments');
            expect(this.getChatLogs(5)).toContain('Fine Katana, Charge! and Assassination are removed from the game from the top of player2\'s conflict deck');
            expect(this.getChatLogs(5)).toContain('Fine Katana and Fine Katana are removed from the game due to sharing a name with a card that was removed from the deck');
        });

        it('should remove attachments from play that your opponent controls that match a name (1 attachment, no match)', function () {
            this.player2.moveCard(this.fan, 'conflict deck');
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.goblin);
            this.player1.clickCard(this.goblin);
            expect(this.voice.location).toBe('conflict deck');
            expect(this.charge.location).toBe('removed from game');
            expect(this.assassination.location).toBe('removed from game');
            expect(this.fan.location).toBe('removed from game');

            expect(this.katana2.location).toBe('play area');
            expect(this.katana3.location).toBe('play area');
            expect(this.katana4.location).toBe('hand');

            expect(this.katana1.location).toBe('play area');
            expect(this.am1.location).toBe('play area');
            expect(this.am2.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain('player1 uses Scavenging Goblin to remove the top 3 cards of player2\'s conflict deck from the game as well as any matching attachments');
            expect(this.getChatLogs(5)).toContain('Ornate Fan, Charge! and Assassination are removed from the game from the top of player2\'s conflict deck');
        });

        it('should remove attachments from play that your opponent controls that match a name (3 attachments, including monk)', function () {
            this.player2.moveCard(this.fan, 'conflict deck');
            this.player2.moveCard(this.katana4, 'conflict deck');
            this.player2.moveCard(this.am3, 'conflict deck');
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.goblin);
            this.player1.clickCard(this.goblin);
            expect(this.voice.location).toBe('conflict deck');
            expect(this.charge.location).toBe('conflict deck');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.fan.location).toBe('removed from game');

            expect(this.katana2.location).toBe('removed from game');
            expect(this.katana3.location).toBe('removed from game');
            expect(this.katana4.location).toBe('removed from game');

            expect(this.katana1.location).toBe('play area');
            expect(this.am1.location).toBe('removed from game');
            expect(this.am2.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain('player1 uses Scavenging Goblin to remove the top 3 cards of player2\'s conflict deck from the game as well as any matching attachments');
            expect(this.getChatLogs(5)).toContain('Fine Katana, Fine Katana and Ancient Master are removed from the game due to sharing a name with a card that was removed from the deck');
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
