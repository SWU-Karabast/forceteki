describe('Day of Brother Horse', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['day-of-brother-horse'],
                    inPlay: ['adept-of-the-waves', 'solemn-scholar', 'miya-mystic']
                },
                player2: {
                    inPlay: ['miya-mystic']
                }
            });

            this.dayofBrotherHorse = this.player1.findCardByName('day-of-brother-horse');
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.solemn = this.player1.findCardByName('solemn-scholar');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.adept.bow();
            this.solemn.bow();
        });

        it('triggers when you pass a conflict', function () {
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.dayofBrotherHorse);
        });

        it('does not trigger if you have no ready characters', function () {
            this.mystic.bow();

            this.noMoreActions();
            this.player1.clickPrompt('Pass');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('if triggered, protects a ring, draw 3 cards and discard 1 card', function () {
            const initialHandSize = this.player1.hand.length;
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            this.player1.clickCard(this.dayofBrotherHorse);
            expect(this.player1).toHavePrompt('Choose a ring');

            this.player1.clickRing('fire');
            expect(this.player1).toHavePrompt('Choose a card to discard');
            expect(this.player1).not.toBeAbleToSelect(this.dayofBrotherHorse);
            this.player1.clickCard(this.player1.hand[0]);

            expect(this.player1.hand.length).toBe(initialHandSize + 1);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays Day of Brother Horse to prevent player2 from declaring Fire Ring conflicts, draw 3 cards, and discard 1 card - it's a sunny day filled with celebration. The Moto share tales of the desert!"
            );

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Initiate Conflict');

            this.player2.clickRing('fire');
            expect(this.game.rings.fire.contested).toBe(false);

            this.player2.clickRing('air');
            expect(this.game.rings.air.contested).toBe(true);
        });
    });
});