describe('Midnight Builder', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'hida-kisada', 'midnight-builder'],
                    dynastyDiscard: ['watchtower-of-valor', 'funeral-pyre']
                },
                player2: {
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.builder = this.player1.findCardByName('midnight-builder');
            this.watchtower = this.player1.placeCardInProvince('watchtower-of-valor', 'province 1');
            this.pyre = this.player1.placeCardInProvince('funeral-pyre', 'province 3');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
        });

        it('not dire - should add 2 to the strength for holdings', function () {
            this.builder.fate = 1;
            this.game.checkGameState(true);
            expect(this.p1.getStrength()).toBe(3 + 1 + 2);
            expect(this.p2.getStrength()).toBe(3);
            expect(this.p3.getStrength()).toBe(3 + 0 + 2);
            expect(this.p4.getStrength()).toBe(3);
        });

        it('dire - should add 2 to the strength for holdings', function () {
            this.builder.fate = 0;
            this.game.checkGameState(true);
            expect(this.p1.getStrength()).toBe(3 + 1 + 2);
            expect(this.p2.getStrength()).toBe(3);
            expect(this.p3.getStrength()).toBe(3 + 0 + 2);
            expect(this.p4.getStrength()).toBe(3);
        });

        it('dire - should let you trigger provinces twice', function () {
            this.builder.fate = 0;
            this.game.checkGameState(true);
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.pyre);
            this.player1.clickCard(this.kisada);
            this.player2.pass();
            this.player1.clickCard(this.pyre);
            this.player1.clickCard(this.kuwanan);
            this.player2.pass();
            this.player1.clickCard(this.pyre);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player1.hand.length).toBe(hand + 2);
        });

        it('not dire - should not let you trigger provinces twice', function () {
            this.builder.fate = 1;
            this.game.checkGameState(true);
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.pyre);
            this.player1.clickCard(this.kisada);
            this.player2.pass();
            this.player1.clickCard(this.pyre);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player1.hand.length).toBe(hand + 1);
        });
    });
});

