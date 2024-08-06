describe('Masterpiece Painter', function() {
    integration(function() {
        describe('Masterpiece Painter\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['masterpiece-painter'],
                        conflictDeck: ['fine-katana']
                    },
                    player2: {
                        inPlay: ['ikoma-prodigy'],
                        conflictDeck: ['ornate-fan']
                    }
                });
                this.masterpiecePainter = this.player1.findCardByName('masterpiece-painter');
                this.katana = this.player1.moveCard('fine-katana', 'conflict deck');

                this.fan = this.player2.moveCard('ornate-fan', 'conflict deck');
                this.ikomaProdigy = this.player2.findCardByName('ikoma-prodigy');
            });

            it('should give you the option to choose a player', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');
            });

            it('should display the effect message - (p1 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player1');

                expect(this.getChatLogs(3)).toContain('player1 uses Masterpiece Painter to make player1 reveal the top card of their deck. They may play their card until the end of the phase.');
            });

            it('should display the effect message - (p2 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player2');

                expect(this.getChatLogs(3)).toContain('player1 uses Masterpiece Painter to make player2 reveal the top card of their deck. They may play their card until the end of the phase.');
            });

            it('should display the effect message - (p1 and p2 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player1 and player2');

                expect(this.getChatLogs(3)).toContain('player1 uses Masterpiece Painter to make player1 and player2 reveal the top card of their deck. They may play their card until the end of the phase.');
            });

            it('should let the target play the top card of their deck. - (p1 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player1');

                this.player2.pass();

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(true);
                expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.masterpiecePainter);
                expect(this.katana.parent).toBe(this.masterpiecePainter);
            });

            it('should let the target play the top card of their deck. - (p2 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player2');

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
                expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(true);

                this.player2.clickCard(this.fan);
                this.player2.clickCard(this.ikomaProdigy);
                expect(this.fan.parent).toBe(this.ikomaProdigy);
            });

            it('should let the target play the top card of their deck. - (p1 and p2 target)', function () {
                this.player1.clickCard('masterpiece-painter');
                expect(this.player1).toHavePrompt('Choose any number of players');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).toHavePromptButton('player1 and player2');

                this.player1.clickPrompt('player1 and player2');

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(true);
                expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(true);

                this.player2.clickCard(this.fan);
                this.player2.clickCard(this.ikomaProdigy);
                expect(this.fan.parent).toBe(this.ikomaProdigy);

                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.masterpiecePainter);
                expect(this.katana.parent).toBe(this.masterpiecePainter);
            });
        });
    });
});

describe('Masterpiece Painter - opponent controls', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['masterpiece-painter', 'brash-samurai'],
                    conflictDeck: ['fine-katana']
                },
                player2: {
                    inPlay: ['ikoma-prodigy'],
                    conflictDeck: ['ornate-fan'],
                    hand: ['stoke-insurrection']
                }
            });
            this.masterpiecePainter = this.player1.findCardByName('masterpiece-painter');
            this.katana = this.player1.moveCard('fine-katana', 'conflict deck');

            this.fan = this.player2.moveCard('ornate-fan', 'conflict deck');
            this.stoke = this.player2.findCardByName('stoke-insurrection');
            this.ikomaProdigy = this.player2.findCardByName('ikoma-prodigy');
            this.player1.placeCardInProvince(this.masterpiecePainter, 'province 1');

            this.noMoreActions();
            this.initiateConflict({
                attackers: ['brash-samurai'],
                defenders: []
            });

            this.player2.clickCard(this.stoke);
            this.player2.clickCard(this.masterpiecePainter);
            this.player2.clickPrompt('Done');
            this.player1.pass();
        });

        it('should give you the option to choose a player', function () {
            this.player2.clickCard(this.masterpiecePainter);
            expect(this.player2).toHavePrompt('Choose any number of players');
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            expect(this.player2).toHavePromptButton('player1 and player2');
        });

        it('should display the effect message - (p1 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            expect(this.player2).toHavePrompt('Choose any number of players');
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            expect(this.player2).toHavePromptButton('player1 and player2');

            this.player2.clickPrompt('player1');

            expect(this.getChatLogs(3)).toContain('player2 uses Masterpiece Painter to make player1 reveal the top card of their deck. They may play their card until the end of the phase.');
        });

        it('should display the effect message - (p2 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            expect(this.player2).toHavePrompt('Choose any number of players');
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            expect(this.player2).toHavePromptButton('player1 and player2');

            this.player2.clickPrompt('player2');

            expect(this.getChatLogs(3)).toContain('player2 uses Masterpiece Painter to make player2 reveal the top card of their deck. They may play their card until the end of the phase.');
        });

        it('should display the effect message - (p1 and p2 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            expect(this.player2).toHavePrompt('Choose any number of players');
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            expect(this.player2).toHavePromptButton('player1 and player2');

            this.player2.clickPrompt('player1 and player2');

            expect(this.getChatLogs(3)).toContain('player2 uses Masterpiece Painter to make player1 and player2 reveal the top card of their deck. They may play their card until the end of the phase.');
        });

        it('should let the target play the top card of their deck. - (p1 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            this.player2.clickPrompt('player1');

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(true);
            expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(false);
            expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.masterpiecePainter);
            expect(this.katana.parent).toBe(this.masterpiecePainter);
        });

        it('should let the target play the top card of their deck. - (p2 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            this.player2.clickPrompt('player2');

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(true);

            this.player1.pass();
            this.player2.clickCard(this.fan);
            this.player2.clickCard(this.ikomaProdigy);
            expect(this.fan.parent).toBe(this.ikomaProdigy);
        });

        it('should let the target play the top card of their deck. - (p1 and p2 target)', function () {
            this.player2.clickCard(this.masterpiecePainter);
            this.player2.clickPrompt('player1 and player2');

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(true);
            expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(true);

            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.masterpiecePainter);
            expect(this.katana.parent).toBe(this.masterpiecePainter);

            this.player2.clickCard(this.fan);
            this.player2.clickCard(this.ikomaProdigy);
            expect(this.fan.parent).toBe(this.ikomaProdigy);
        });
    });
});

