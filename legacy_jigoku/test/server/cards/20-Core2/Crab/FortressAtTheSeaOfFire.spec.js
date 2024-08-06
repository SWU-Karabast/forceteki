describe('Fortress at the Sea of Fire', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-challenger'],
                },
                player2: {
                    inPlay: ['doji-kuwanan', 'crisis-breaker'],
                    stronghold: ['fortress-at-the-sea-of-fire']
                }
            });

            this.brashSamurai = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.breaker = this.player2.findCardByName('crisis-breaker');

            this.breaker.bowed = true;

            this.crabBox = this.player2.findCardByName('fortress-at-the-sea-of-fire');
        });

        it('if you win on defense should bow or ready someone at home - bow', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brashSamurai],
                defenders: [this.kuwanan]
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.crabBox);

            this.player2.clickCard(this.crabBox);
            expect(this.player2).not.toBeAbleToSelect(this.brashSamurai);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.breaker);

            expect(this.challenger.bowed).toBe(false);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.bowed).toBe(true);

            expect(this.getChatLogs(3)).toContain(
                "player2 uses Fortress at the Sea of Fire, bowing Fortress at the Sea of Fire to bow Doji Challenger"
            );
        });

        it('if you win on defense should bow or ready someone at home - ready', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brashSamurai],
                defenders: [this.kuwanan]
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.crabBox);

            this.player2.clickCard(this.crabBox);
            expect(this.player2).not.toBeAbleToSelect(this.brashSamurai);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.breaker);

            expect(this.breaker.bowed).toBe(true);
            this.player2.clickCard(this.breaker);
            expect(this.breaker.bowed).toBe(false);

            expect(this.getChatLogs(3)).toContain(
                "player2 uses Fortress at the Sea of Fire, bowing Fortress at the Sea of Fire to ready Crisis Breaker"
            );
        });

        it('should not trigger if you don\'t win', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brashSamurai, this.challenger],
                defenders: [this.kuwanan],
                ring: 'void'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
