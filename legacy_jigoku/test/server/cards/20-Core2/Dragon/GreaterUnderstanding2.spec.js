describe('Greater Understanding 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-yokuni'],
                    hand: ['greater-understanding-2']
                },
                player2: {
                    stronghold: 'temple-of-the-fivefold-path'
                }
            });

            this.greaterUnderstanding = this.player1.findCardByName('greater-understanding-2');
            this.togashiYokuni = this.player1.findCardByName('togashi-yokuni');
            this.togashiYokuni.fate = 1;
            this.togashiYokuni.bow();

            this.t5p = this.player2.findCardByName('temple-of-the-fivefold-path');

            this.game.rings.air.fate = 2;
            this.game.rings.earth.fate = 1;
            this.game.rings.fire.fate = 0;
            this.game.rings.void.fate = 0;
            this.game.rings.water.fate = 0;
        });

        it('resolve a ring effect then moves to another ring', function () {
            this.player1.clickCard(this.greaterUnderstanding);
            this.player1.clickRing('fire');

            this.player2.clickCard(this.t5p);
            this.player2.clickRing('fire');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.greaterUnderstanding);

            this.player1.clickCard(this.greaterUnderstanding);
            expect(this.getChatLogs(5)).toContain('player1 uses Greater Understanding to resolve Fire Ring effect');

            this.player1.clickCard(this.togashiYokuni);
            this.player1.clickPrompt('Honor Togashi Yokuni');
            expect(this.player2).toHavePrompt('Choose a ring to attach Greater Understanding');
            this.player2.clickRing('void');
            expect(this.getChatLogs(5)).toContain(
                'player2 moves Greater Understanding to Void Ring - enlightenment is elusive'
            );
        });

        it('resolve a ring effect then stays on same ring if no targets to move', function () {
            this.game.rings.void.fate = 1;
            this.game.rings.water.fate = 1;

            this.player1.clickCard(this.greaterUnderstanding);
            this.player1.clickRing('fire');

            this.player2.clickCard(this.t5p);
            this.player2.clickRing('fire');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.greaterUnderstanding);

            this.player1.clickCard(this.greaterUnderstanding);
            expect(this.getChatLogs(5)).toContain('player1 uses Greater Understanding to resolve Fire Ring effect');

            this.player1.clickCard(this.togashiYokuni);
            this.player1.clickPrompt('Honor Togashi Yokuni');
            expect(this.player2).not.toHavePrompt('Choose a ring to attach Greater Understanding');
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
