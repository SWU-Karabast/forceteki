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

    describe('When multiple units are defeated simultaneously,', function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'action',
                player1: {
                    hand: ['superlaser-blast'],
                    groundArena: ['general-krell#heartless-tactician'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    base: { card: 'administrators-tower', damage: 5 }
                },
                player2: {
                    groundArena: ['superlaser-technician', 'yoda#old-master'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });
        });

        it('the active player should choose which player\'s triggers happen first, then each player should be able to choose the order of their triggers in turn', function () {
            this.player1.clickCard(this.superlaserBlast);

            // all units defeated
            expect(this.generalKrell).toBeInLocation('discard');
            expect(this.cartelSpacer).toBeInLocation('discard');
            expect(this.superlaserTechnician).toBeInLocation('discard');
            expect(this.yoda).toBeInLocation('discard');
            expect(this.idenVersio).toBeInLocation('base');
            expect(this.lukeSkywalker).toBeInLocation('base');

            // triggered abilities happen
            expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
            this.player1.clickPrompt('You');
            expect(this.player1).toHavePrompt('Choose an ability to resolve:');
            expect(this.player1).toHaveExactPromptButtons['Draw a card', 'Draw a card', 'When an opponent\'s unit is defeated, heal 1 from base', 'When an opponent\'s unit is defeated, heal 1 from base', 'When an opponent\'s unit is defeated, heal 1 from base'];
            this.player1.clickPrompt('When an opponent\'s unit is defeated, heal 1 from base');
            this.player1.clickPrompt('When an opponent\'s unit is defeated, heal 1 from base');
            this.player1.clickPrompt('Draw a card');
            // may ability prompts the player whether or not to actually use it before it fully resolves
            expect(this.player1).toHavePassAbilityPrompt('Draw a card');
            this.player1.clickPrompt('Draw a card');
            expect(this.player1).toHaveExactPromptButtons['Draw a card', 'When an opponent\'s unit is defeated, heal 1 from base'];
            this.player1.clickPrompt('When an opponent\'s unit is defeated, heal 1 from base');
            // last trigger is chosen automatically
            expect(this.player1).toHavePassAbilityPrompt('Draw a card');
            this.player1.clickPrompt('Pass');

            // automatically moves to other player's triggers
            expect(this.player2).toHavePrompt('Choose an ability to resolve:');
            expect(this.player2).toHaveExactPromptButtons['Put Superlaser Technician into play as a resource and ready it', 'Choose any number of players to draw 1 card'];
            this.player2.clickPrompt('Choose any number of players to draw 1 card');
            this.player2.clickPrompt('You');
            expect(this.player2).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
            this.player2.clickPrompt('Put Superlaser Technician into play as a resource and ready it');

            // triggers all done, action is finally over
            expect(this.player2).toBeActivePlayer();

            // checking trigger effects all happened properly
            expect(this.p1Base.damage).toBe(2);
            expect(this.player1.hand.length).toBe(1);
            expect(this.player2.hand.length).toBe(1);
            expect(this.superlaserTechnician).toBeInLocation('resource');
        });
    });
});
