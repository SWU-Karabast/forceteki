describe('Agasha Sumiko 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['agasha-sumiko-2'],
                    conflictDiscard: ['fine-katana', 'ornate-fan', 'assassination']
                },
                player2: {
                    hand: ['i-can-swim'],
                    conflictDiscard: ['fine-katana', 'ornate-fan', 'assassination', 'let-go']
                }
            });
            this.swim = this.player2.findCardByName('i-can-swim');
            this.sumiko = this.player1.findCardByName('agasha-sumiko-2');

            this.katana1 = this.player1.findCardByName('fine-katana');
            this.fan1 = this.player1.findCardByName('ornate-fan');
            this.assassination1 = this.player1.findCardByName('assassination');

            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.letGo = this.player2.findCardByName('let-go');

            this.player1.player.showBid = 1;
            this.player2.player.showBid = 5;
            this.sumiko.dishonor();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.sumiko],
                defenders: []
            });
        });

        it('should cause opponent to lose 2 honor if they have more honor', function() {
            this.player2.honor = 11;
            this.player1.honor = 10;

            let p2honor = this.player2.honor;
            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sumiko);
            this.player1.clickCard(this.sumiko);
            expect(this.player2.honor).toBe(p2honor - 2);
        });

        it('should not trigger - equal honor, equal fate, equal cards', function() {
            this.player2.honor = 10;
            this.player1.honor = 10;
            this.player2.fate = 12; //2 for swim
            this.player1.fate = 10;

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger - more honor, fate, and cards', function() {
            this.player2.honor = 10;
            this.player1.honor = 12;
            this.player2.fate = 12; //2 for swim
            this.player1.fate = 12;
            this.player1.moveCard(this.katana1, 'hand');

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should cause opponent to lose 2 fate if they have more fate', function() {
            this.player2.fate = 13;
            this.player1.fate = 10;

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            let p2Fate = this.player2.fate;
            expect(this.player1).toBeAbleToSelect(this.sumiko);
            this.player1.clickCard(this.sumiko);
            expect(this.player2.fate).toBe(p2Fate - 2);
        });

        it('should cause opponent to choose and discard 2 cards if they have more cards', function() {
            this.player2.moveCard(this.katana2, 'hand');
            this.player2.moveCard(this.fan2, 'hand');
            this.player2.moveCard(this.assassination2, 'hand');

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            let p2Hand = this.player2.hand.length;
            expect(this.player1).toBeAbleToSelect(this.sumiko);
            this.player1.clickCard(this.sumiko);
            expect(this.player2).toHavePrompt('Choose 2 cards to discard');
            expect(this.player2).toBeAbleToSelect(this.katana2);
            expect(this.player2).toBeAbleToSelect(this.fan2);
            expect(this.player2).toBeAbleToSelect(this.assassination2);
            expect(this.player2).not.toBeAbleToSelect(this.letGo);
            expect(this.player2).not.toBeAbleToSelect(this.swim);

            expect(this.katana2.location).toBe('hand');
            expect(this.fan2.location).toBe('hand');
            this.player2.clickCard(this.katana2);
            this.player2.clickCard(this.fan2);
            this.player2.clickPrompt('Done');

            expect(this.player2.hand.length).toBe(p2Hand - 2);
            expect(this.katana2.location).toBe('conflict discard pile');
            expect(this.fan2.location).toBe('conflict discard pile');
        });

        it('should cause opponent to lose 2 fate if they have more fate', function() {
            this.player2.honor = 11;
            this.player1.honor = 10;
            this.player2.fate = 13;
            this.player1.fate = 10;
            this.player2.moveCard(this.katana2, 'hand');
            this.player2.moveCard(this.fan2, 'hand');
            this.player2.moveCard(this.assassination2, 'hand');

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            let p2Fate = this.player2.fate;
            let p2Honor = this.player2.honor;
            let p2Hand = this.player2.hand.length;
            expect(this.player1).toBeAbleToSelect(this.sumiko);
            this.player1.clickCard(this.sumiko);
            expect(this.player2).toHavePrompt('Choose 2 cards to discard');
            this.player2.clickCard(this.katana2);
            this.player2.clickCard(this.fan2);
            this.player2.clickPrompt('Done');

            expect(this.player2.honor).toBe(p2Honor - 2);
            expect(this.player2.fate).toBe(p2Fate - 2);
            expect(this.player2.hand.length).toBe(p2Hand - 2);
            expect(this.katana2.location).toBe('conflict discard pile');
            expect(this.fan2.location).toBe('conflict discard pile');
        });

        it('chat messages - all 3', function() {
            this.player2.honor = 11;
            this.player1.honor = 10;
            this.player2.fate = 13;
            this.player1.fate = 10;
            this.player2.moveCard(this.katana2, 'hand');
            this.player2.moveCard(this.fan2, 'hand');
            this.player2.moveCard(this.assassination2, 'hand');

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            this.player1.clickCard(this.sumiko);
            this.player2.clickCard(this.katana2);
            this.player2.clickCard(this.fan2);
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(5)).toContain('player1 uses Agasha Sumiko to make player2 lose 2 honor, lose 2 fate and disard 2 cards');
            expect(this.getChatLogs(5)).toContain('player2 discards Fine Katana and Ornate Fan');
        });

        it('chat messages - just 2', function() {
            this.player2.honor = 10;
            this.player1.honor = 10;
            this.player2.fate = 13;
            this.player1.fate = 10;
            this.player2.moveCard(this.katana2, 'hand');
            this.player2.moveCard(this.fan2, 'hand');
            this.player2.moveCard(this.assassination2, 'hand');

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            this.player1.clickCard(this.sumiko);
            this.player2.clickCard(this.katana2);
            this.player2.clickCard(this.fan2);
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(5)).toContain('player1 uses Agasha Sumiko to make player2 lose 2 fate and disard 2 cards');
            expect(this.getChatLogs(5)).toContain('player2 discards Fine Katana and Ornate Fan');
        });

        it('chat messages - just 1', function() {
            this.player2.honor = 15;
            this.player1.honor = 10;
            this.player2.fate = 10;
            this.player1.fate = 10;

            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.sumiko);
            this.player1.clickCard(this.sumiko);

            expect(this.getChatLogs(5)).toContain('player1 uses Agasha Sumiko to make player2 lose 2 honor');
        });
    });
});
