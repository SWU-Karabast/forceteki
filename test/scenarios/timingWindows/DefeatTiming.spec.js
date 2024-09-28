describe('Defeat timing', function() {
    integration(function() {
        describe('When a unit enters play with a constant ability that defeats other units,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['maz-kanata#pirate-queen'],
                    },
                    player2: {
                        groundArena: ['vanguard-infantry'],
                    }
                });
            });

            it('"when played" and "when defeated" triggers should go in the same window', function () {
                this.player1.clickCard(this.supremeLeaderSnoke);
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(this.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                this.player1.clickPrompt('You');
                expect(this.mazKanata).toHaveExactUpgradeNames(['experience']);

                // vanguard on-defeat trigger happens next automatically
                expect(this.player2).toBeAbleToSelectExactly([this.mazKanata, this.supremeLeaderSnoke]);
                this.player2.clickPrompt('Pass ability');

                expect(this.player2).toBeActivePlayer();
            });
        });

        // TODO: add a similar test for Dodonna and units leaving the field due to a +hp modifier going away
        describe('When a unit enters play and is immediately defeated by a constant ability,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                    },
                    player2: {
                        hand: ['vanguard-infantry'],
                        groundArena: [{ card: 'maz-kanata#pirate-queen', upgrades: ['experience', 'experience'] }]
                    }
                });
            });

            it('"when played" and "when defeated" triggers should go in the same window', function () {
                this.player1.passAction();

                this.player2.clickCard(this.vanguardInfantry);
                expect(this.player2).toHavePrompt('Choose an ability to resolve:');
                expect(this.player1).toHavePrompt('Waiting for opponent to use Choose Triggered Ability Resolution Order');
                expect(this.vanguardInfantry).toBeInLocation('discard');

                this.player2.clickPrompt('Give an Experience token to a unit');
                this.player2.clickPrompt('Pass ability');

                // maz kanata on-play trigger happens next automatically
                expect(this.mazKanata).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
                expect(this.player1).toBeActivePlayer();
            });
        });
    });
});
