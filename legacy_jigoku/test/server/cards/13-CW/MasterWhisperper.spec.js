describe('Master Whisperer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-whisperer'],
                    hand: ['way-of-the-scorpion', 'way-of-the-crane', 'way-of-the-dragon'],
                    conflictDeck: ['fine-katana', 'ornate-fan', 'duty', 'assassination'],
                    conflictDiscard: ['kakita-blade']
                },
                player2: {
                    hand: ['way-of-the-scorpion', 'way-of-the-crane', 'way-of-the-dragon'],
                    conflictDeck: ['fine-katana', 'ornate-fan', 'duty', 'assassination'],
                    conflictDiscard: ['let-go'],
                    dynastyDiscard: ['hantei-xxxviii']
                }
            });

            this.master = this.player1.findCardByName('master-whisperer');
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.dragon = this.player1.findCardByName('way-of-the-dragon');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.duty = this.player1.findCardByName('duty');
            this.assassination = this.player1.findCardByName('assassination');
            this.blade = this.player1.findCardByName('kakita-blade');

            this.scorpion2 = this.player2.findCardByName('way-of-the-scorpion');
            this.crane2 = this.player2.findCardByName('way-of-the-crane');
            this.dragon2 = this.player2.findCardByName('way-of-the-dragon');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.duty2 = this.player2.findCardByName('duty');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.letGo = this.player2.findCardByName('let-go');

            this.hantei = this.player2.findCardByName('hantei-xxxviii');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player2.reduceDeckToNumber('conflict deck', 0);

            this.player1.moveCard(this.assassination, 'conflict deck');
            this.player1.moveCard(this.duty, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');

            this.player2.moveCard(this.assassination2, 'conflict deck');
            this.player2.moveCard(this.duty2, 'conflict deck');
            this.player2.moveCard(this.fan2, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');
        });

        it('should allow selecting either player', function() {
            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should allow selecting a player with no hand', function() {
            this.player2.moveCard(this.crane2, 'conflict discard pile');
            this.player2.moveCard(this.scorpion2, 'conflict discard pile');
            this.player2.moveCard(this.dragon2, 'conflict discard pile');
            expect(this.player2.hand.length).toBe(0);

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should allow using if neither player have any cards', function() {
            this.player1.moveCard(this.crane, 'conflict discard pile');
            this.player1.moveCard(this.scorpion, 'conflict discard pile');
            this.player1.moveCard(this.dragon, 'conflict discard pile');
            expect(this.player1.hand.length).toBe(0);

            this.player2.moveCard(this.crane2, 'conflict discard pile');
            this.player2.moveCard(this.scorpion2, 'conflict discard pile');
            this.player2.moveCard(this.dragon2, 'conflict discard pile');
            expect(this.player2.hand.length).toBe(0);

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should prompt the chosen player to discard 3 cards then draw 3 cards (self)', function() {
            this.player1.moveCard(this.blade, 'hand');

            let hand = this.player1.hand.length;

            expect(this.katana.location).toBe('conflict deck');
            expect(this.fan.location).toBe('conflict deck');
            expect(this.duty.location).toBe('conflict deck');
            expect(this.assassination.location).toBe('conflict deck');

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player1');
            expect(this.getChatLogs(1)).toContain('player1 uses Master Whisperer to make player1 discard 3 cards and draw 3 cards');
            expect(this.player1).toHavePrompt('Choose 3 cards to discard');

            this.player1.clickCard(this.scorpion);
            this.player1.clickCard(this.dragon);
            this.player1.clickCard(this.crane);
            this.player1.clickPrompt('Done');

            expect(this.scorpion.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('hand');
            expect(this.fan.location).toBe('hand');
            expect(this.duty.location).toBe('hand');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(1)).toContain('player1 discards Way of the Scorpion, Way of the Dragon and Way of the Crane');
        });

        it('should prompt the chosen player to discard 3 cards then draw 3 cards (opponent)', function() {
            this.player2.moveCard(this.letGo, 'hand');
            let hand = this.player2.hand.length;

            expect(this.katana2.location).toBe('conflict deck');
            expect(this.fan2.location).toBe('conflict deck');
            expect(this.duty2.location).toBe('conflict deck');
            expect(this.assassination2.location).toBe('conflict deck');

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');

            this.player2.clickCard(this.scorpion2);
            this.player2.clickCard(this.dragon2);
            this.player2.clickCard(this.crane2);
            this.player2.clickPrompt('Done');

            expect(this.scorpion2.location).toBe('conflict discard pile');
            expect(this.crane2.location).toBe('conflict discard pile');
            expect(this.dragon2.location).toBe('conflict discard pile');
            expect(this.katana2.location).toBe('hand');
            expect(this.fan2.location).toBe('hand');
            expect(this.duty2.location).toBe('hand');
            expect(this.assassination2.location).toBe('conflict deck');
            expect(this.player2.hand.length).toBe(hand);
            expect(this.getChatLogs(2)).toContain('player1 uses Master Whisperer to make player2 discard 3 cards and draw 3 cards');
            expect(this.getChatLogs(1)).toContain('player2 discards Way of the Scorpion, Way of the Dragon and Way of the Crane');
        });

        it('should discard the whole hand if you have less than 3 cards and still draw 3 cards', function() {
            this.player1.moveCard(this.dragon, 'conflict discard pile');
            expect(this.player1.hand.length).toBe(2);

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player1');

            expect(this.scorpion.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('hand');
            expect(this.fan.location).toBe('hand');
            expect(this.duty.location).toBe('hand');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.player1.hand.length).toBe(3);
            expect(this.getChatLogs(2)).toContain('player1 uses Master Whisperer to make player1 discard 2 cards and draw 3 cards');
            expect(this.getChatLogs(1)).toContain('player1 discards Way of the Scorpion and Way of the Crane');
        });

        it('should discard nothing if you have no cards and still draw 3 cards', function() {
            this.player1.moveCard(this.crane, 'conflict discard pile');
            this.player1.moveCard(this.scorpion, 'conflict discard pile');
            this.player1.moveCard(this.dragon, 'conflict discard pile');
            expect(this.player1.hand.length).toBe(0);

            this.player1.clickCard(this.master);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player1');

            expect(this.scorpion.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('hand');
            expect(this.fan.location).toBe('hand');
            expect(this.duty.location).toBe('hand');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.player1.hand.length).toBe(3);
            expect(this.getChatLogs(1)).toContain('player1 uses Master Whisperer to make player1 draw 3 cards');
        });

        it('should allow using Hantei to pick the player', function() {
            this.player1.moveCard(this.assassination, 'hand');

            this.player2.moveCard(this.hantei, 'play area');
            expect(this.hantei.location).toBe('play area');
            this.player1.clickCard(this.master);
            this.player1.clickPrompt('player2');

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.hantei);
            this.player2.clickCard(this.hantei);
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            this.player2.clickPrompt('player1');
            expect(this.player1).toHavePrompt('Choose 3 cards to discard');
        });
    });
});
