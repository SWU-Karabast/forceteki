describe('Search Your Feelings', function() {
    integration(function() {
        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        deck: ['battlefield-marine', 'cartel-spacer', 'cell-block-guard', 'pyke-sentinel', 'volunteer-soldier']
                    }
                });

                this.searchYourFeelings = this.player1.findCardByName('search-your-feelings');

                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.cellBlockGuard = this.player1.findCardByName('cell-block-guard');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.volunteerSoldier = this.player1.findCardByName('volunteer-soldier');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('should be able to retrieve ANY card from the deck', function () {
                // Play card
                this.player1.clickCard(this.searchYourFeelings);
                expect(this.searchYourFeelings).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons([this.battlefieldMarine, this.cartelSpacer.title, this.cellBlockGuard.title,
                    this.pykeSentinel.title, this.volunteerSoldier.title, 'Take nothing']);

                // Choose card
                this.player1.clickPrompt(this.battlefieldMarine.title);
                expect(this.player2).toBeActivePlayer();
                expect(this.battlefieldMarine).toBeInLocation('hand');
                expect(this.player1.deck.length).toBe(4);
            });

            it('should be able to choose no cards', function () {
                // Play card
                this.player1.clickCard(this.searchYourFeelings);
                expect(this.searchYourFeelings).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons([this.battlefieldMarine, this.cartelSpacer.title, this.cellBlockGuard.title,
                    this.pykeSentinel.title, this.volunteerSoldier.title, 'Take nothing']);

                // Choose card
                this.player1.clickPrompt('Take nothing');
                expect(this.player2).toBeActivePlayer();
                expect(this.player1.deck.length).toBe(5);
            });

            it('works with just one card in deck', function () {
                // Set up deck
                this.player1.setDeck([this.battlefieldMarine]);

                // Play card
                this.player1.clickCard(this.searchYourFeelings);
                expect(this.searchYourFeelings).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons([this.battlefieldMarine, 'Take nothing']);

                // Choose card
                this.player1.clickPrompt(this.battlefieldMarine.title);
                expect(this.player2).toBeActivePlayer();
            });

            it('does nothing if deck is empty', function () {
                // Set up deck
                this.player1.setDeck([]);

                // Play card
                this.player1.clickCard(this.searchYourFeelings);
                expect(this.searchYourFeelings).toBeInLocation('discard');

                // Choose nothing
                expect(this.player1).toHaveEnabledPromptButtons(['Take nothing']);
                this.player1.clickPrompt('Take nothing');
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        deck: 30
                    }
                });

                this.searchYourFeelings = this.player1.findCardByName('search-your-feelings');
            });

            it('shuffles the deck', function () {
                let preShuffleDeck = this.player1.deck;

                // Sanity check for the comparison
                expect(preShuffleDeck).toEqual(this.player1.deck);

                // Take nothing (deck will still shuffle)
                this.player1.clickCard(this.searchYourFeelings);
                this.player1.clickPrompt('Take nothing');

                expect(preShuffleDeck).not.toEqual(this.player1.deck);
            });
        });
    });
});
