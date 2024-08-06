describe('Field Tactician', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['field-tactician'],
                    hand: ['prove-your-skill', 'soul-beyond-reproach'],
                    conflictDiscard: ['fine-katana', 'ornate-fan', 'assassination', 'let-go', 'renowned-singer'],
                    dynastyDiscard: ['guest-of-honor']
                },
                player2: {
                    honor: 10,
                    inPlay: ['field-tactician', 'daidoji-uji'],
                    conflictDiscard: ['fine-katana']
                }
            });

            this.tactician = this.player1.findCardByName('field-tactician');
            this.tactician2 = this.player2.findCardByName('field-tactician');
            this.skill = this.player1.findCardByName('prove-your-skill');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.guest = this.player1.findCardByName('guest-of-honor');
            this.tactician.dishonor();

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.katana = this.player1.moveCard('fine-katana', 'conflict deck');
            this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
            this.assassination = this.player1.moveCard('assassination', 'conflict deck');
            this.letGo = this.player1.moveCard('let-go', 'conflict deck');
            this.singer = this.player1.findCardByName('renowned-singer');

            this.katana2 = this.player2.findCardByName('fine-katana');
        });

        it('should react to playing a tactic', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.tactician);
        });

        it('should let you pick a card in a conflict discard pile', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            expect(this.player1).not.toBeAbleToSelect(this.guest);
            expect(this.player1).toBeAbleToSelect(this.skill);
            expect(this.player1).toBeAbleToSelect(this.singer);
            expect(this.player1).toBeAbleToSelect(this.katana2);
        });

        it('should put the card 3rd from the top', function() {
            expect(this.player1.conflictDeck[0]).toBe(this.letGo);
            expect(this.player1.conflictDeck[1]).toBe(this.assassination);
            expect(this.player1.conflictDeck[2]).toBe(this.fan);
            expect(this.player1.conflictDeck[3]).toBe(this.katana);

            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.skill);

            expect(this.player1.conflictDeck[0]).toBe(this.letGo);
            expect(this.player1.conflictDeck[1]).toBe(this.assassination);
            expect(this.player1.conflictDeck[2]).toBe(this.skill);
            expect(this.player1.conflictDeck[3]).toBe(this.fan);
            expect(this.player1.conflictDeck[4]).toBe(this.katana);

            expect(this.getChatLogs(5)).toContain('player1 uses Field Tactician to return Prove Your Skill to player1\'s conflict deck');
        });

        it('should put the card 3rd from the top - opponent', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.katana2);

            expect(this.player2.conflictDeck[2]).toBe(this.katana2);
            expect(this.getChatLogs(5)).toContain('player1 uses Field Tactician to return Fine Katana to player2\'s conflict deck');
        });

        it('should not react if opponent plays the tactic', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.katana2);

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not react if you play a non-tactic', function() {
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('test - only 1 card in deck', function() {
            this.player1.reduceDeckToNumber('conflict deck', 1);
            expect(this.player1.conflictDeck[0]).toBe(this.letGo);

            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.skill);

            expect(this.player1.conflictDeck[0]).toBe(this.letGo);
            expect(this.player1.conflictDeck[1]).toBe(this.skill);

            expect(this.getChatLogs(5)).toContain('player1 uses Field Tactician to return Prove Your Skill to player1\'s conflict deck');
        });

        it('test - no cards in deck', function() {
            this.player1.reduceDeckToNumber('conflict deck', 0);

            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.tactician);
            this.player1.clickCard(this.skill);

            expect(this.player1.conflictDeck[0]).toBe(this.skill);

            expect(this.getChatLogs(5)).toContain('player1 uses Field Tactician to return Prove Your Skill to player1\'s conflict deck');
        });
    });
});
