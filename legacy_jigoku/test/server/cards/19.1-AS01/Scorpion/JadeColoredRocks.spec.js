describe('Jade-Colored Rocks', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-tadaka'],
                    hand: ['a-new-name']
                },
                player2: {
                    provinces: ['jade-colored-rocks']
                }
            });

            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');
            this.ann = this.player1.findCardByName('a-new-name');

            this.jadeColoredRocks = this.player2.findCardByName('jade-colored-rocks', 'province 1');
        });

        it('should prompt owner to select 1 option', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            expect(this.player2).toHavePrompt('Choose an option');
            expect(this.player2.currentButtons).toContain('Opponent loses 1 fate');
            expect(this.player2.currentButtons).toContain('Opponent loses 1 honor');
            expect(this.player2.currentButtons).toContain('Opponent discards 1 card at random');
        });

        it('should be unable to trigger with no gamestate change', function() {
            this.player1.fate = 0;
            this.player1.moveCard(this.ann, 'conflict discard pile');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            expect(this.ann.location).toBe('conflict discard pile');
            expect(this.player2).toHavePrompt('Choose an option');
            expect(this.player2.currentButtons).not.toContain('Opponent loses 1 fate');
            expect(this.player2.currentButtons).toContain('Opponent loses 1 honor');
            expect(this.player2.currentButtons).not.toContain('Opponent discards 1 card at random');
        });

        it('should remove 1 fate', function() {
            let initialFate = this.player1.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            this.player2.clickPrompt('Opponent loses 1 fate');
            expect(this.player1.fate).toBe(initialFate - 1);
        });

        it('should remove 1 honor', function() {
            let initialHonor = this.player1.honor;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            this.player2.clickPrompt('Opponent loses 1 honor');
            expect(this.player1.honor).toBe(initialHonor - 1);
        });

        it('should discard a card at random', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            this.player2.clickPrompt('Opponent discards 1 card at random');
            expect(this.ann.location).toBe('conflict discard pile');
        });

        it('should not remove 1 honor if at 6', function() {
            this.player1.honor = 6;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            expect(this.player2).toHavePrompt('Choose an option');
            expect(this.player2.currentButtons).toContain('Opponent loses 1 fate');
            expect(this.player2.currentButtons).not.toContain('Opponent loses 1 honor');
            expect(this.player2.currentButtons).toContain('Opponent discards 1 card at random');
        });

        it('should not remove 1 honor if lower than 6', function() {
            this.player1.honor = 2;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.jadeColoredRocks,
                type: 'military'
            });

            this.player2.clickCard(this.jadeColoredRocks);
            expect(this.player2).toHavePrompt('Choose an option');
            expect(this.player2.currentButtons).toContain('Opponent loses 1 fate');
            expect(this.player2.currentButtons).not.toContain('Opponent loses 1 honor');
            expect(this.player2.currentButtons).toContain('Opponent discards 1 card at random');
        });
    });
});
