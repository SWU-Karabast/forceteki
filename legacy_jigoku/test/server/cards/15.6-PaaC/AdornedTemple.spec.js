describe('Shadowed Village', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['vanguard-warrior', 'bayushi-shoju'],
                    dynastyDiscard: ['adorned-temple', 'bayushi-shoju', 'alibi-artist']
                },
                player2: {
                    inPlay: []
                }
            });
            this.shoju = this.player1.findCardByName('bayushi-shoju', 'play area');
            this.shoju2 = this.player1.findCardByName('bayushi-shoju', 'dynasty discard pile');
            this.warrior = this.player1.findCardByName('vanguard-warrior');

            this.artist = this.player1.placeCardInProvince('alibi-artist', 'province 1');
            this.temple = this.player1.placeCardInProvince('adorned-temple', 'province 2');
            this.player1.placeCardInProvince(this.shoju2, 'province 3');
            this.artist.facedown = false;
            this.temple.facedown = false;
            this.shoju2.facedown = false;
        });

        it('should react to adding fate via card effects', function() {
            this.player1.clickCard(this.warrior);
            this.player1.clickCard(this.shoju);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.temple);
        });

        it('should draw a card if the character is honored', function() {
            let hand = this.player1.hand.length;
            this.shoju.honor();
            this.player1.clickCard(this.warrior);
            this.player1.clickCard(this.shoju);
            this.player1.clickCard(this.temple);
            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Adorned Temple to draw a card');
        });

        it('should draw a card if the character is dishonored', function() {
            let hand = this.player1.hand.length;
            this.shoju.dishonor();
            this.player1.clickCard(this.warrior);
            this.player1.clickCard(this.shoju);
            this.player1.clickCard(this.temple);
            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Adorned Temple to draw a card');
        });

        it('should draw two cards if the character is ordinary', function() {
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.warrior);
            this.player1.clickCard(this.shoju);
            this.player1.clickCard(this.temple);
            expect(this.player1.hand.length).toBe(hand + 2);
            expect(this.getChatLogs(5)).toContain('player1 uses Adorned Temple to draw 2 cards');
        });

        it('should react to adding fate via framework effects', function() {
            this.player1.clickCard(this.shoju2);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.getChatLogs(5)).toContain('player1 discards a duplicate to add 1 fate to Bayushi Shoju');
            expect(this.player2).toHavePrompt('Play cards from provinces');
        });

        it('should react to playing with fate', function() {
            this.player1.clickCard(this.artist);
            this.player1.clickPrompt('2');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Play cards from provinces');
        });
    });
});

describe('Shadowed Village - Putting fate on yourself', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['vanguard-warrior'],
                    dynastyDiscard: ['adorned-temple', 'keeper-initiate'],
                    role: 'keeper-of-air'
                },
                player2: {
                    inPlay: []
                }
            });
            this.warrior = this.player1.findCardByName('vanguard-warrior');
            this.keeper = this.player1.findCardByName('keeper-initiate');

            this.temple = this.player1.placeCardInProvince('adorned-temple', 'province 2');
            this.temple.facedown = false;
        });

        it('should react to keeper adding fate via itself', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [],
                ring: 'air'
            });

            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.keeper);
            this.player1.clickCard(this.keeper);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.temple);
            this.player1.clickCard(this.temple);
            expect(this.getChatLogs(5)).toContain('player1 uses Adorned Temple to draw 2 cards');
        });
    });
});
