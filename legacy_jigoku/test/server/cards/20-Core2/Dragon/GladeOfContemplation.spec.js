describe('Glade of Contemplation', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto'],
                    hand: ['bonds-of-blood', 'breakthrough', 'captive-audience', 'cavalry-reserves']
                },
                player2: {
                    hand: ['adopted-kin', 'ancestral-daisho'],
                    provinces: ['glade-of-contemplation']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');

            this.redwoodsTreehouse = this.player2.findCardByName('glade-of-contemplation', 'province 1');
        });

        it('can draw cards', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                province: this.redwoodsTreehouse
            });

            expect(this.player2).toHavePrompt('Any reactions?');

            this.player2.clickCard(this.redwoodsTreehouse);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Draw cards');
            expect(this.player2).toHavePromptButton('Force opponent to discard cards');

            this.player2.clickPrompt('Draw cards');
            expect(this.player2.hand.length).toBe(4);
            expect(this.player2.hand.length).toBe(this.player1.hand.length);
            expect(this.getChatLogs(3)).toContain('player2 uses Glade of Contemplation to draw cards');
        });

        it('can force discard cards', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                province: this.redwoodsTreehouse
            });

            expect(this.player2).toHavePrompt('Any reactions?');

            this.player2.clickCard(this.redwoodsTreehouse);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Draw cards');
            expect(this.player2).toHavePromptButton('Force opponent to discard cards');

            this.player2.clickPrompt('Force opponent to discard cards');
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Glade of Contemplation to force opponent to discard cards'
            );
            expect(this.player1).toHavePrompt('Choose 2 cards to discard');
            expect(this.player1).toBeAbleToSelect('bonds-of-blood');
            expect(this.player1).toBeAbleToSelect('breakthrough');
            expect(this.player1).toBeAbleToSelect('captive-audience');
            expect(this.player1).toBeAbleToSelect('cavalry-reserves');

            this.player1.clickCard('bonds-of-blood');
            expect(this.player1).not.toHavePromptButton('Done');
            this.player1.clickCard('breakthrough');
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickPrompt('Done');

            expect(this.player2.hand.length).toBe(2);
            expect(this.player2.hand.length).toBe(this.player1.hand.length);
            expect(this.getChatLogs(3)).toContain('player1 discards Bonds of Blood and Breakthrough');
        });
    });
});
