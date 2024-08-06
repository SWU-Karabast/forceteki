describe('Fire and Oil', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'doji-challenger']
                },
                player2: {
                    inPlay: ['borderlands-defender'],
                    dynastyDeck: ['fire-and-oil']
                }
            });
            this.fire = this.player2.placeCardInProvince('fire-and-oil', 'province 1');
            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.borderlandsDefender = this.player2.findCardByName('borderlands-defender');

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.challenger = this.player1.findCardByName('doji-challenger');
        });

        it('should trigger during a conflict at a province you control', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.borderlandsDefender],
                province: this.sd1
            });
            this.player2.clickCard(this.fire);
            expect(this.player2).toHavePrompt('Fire and Oil');
            expect(this.player2).toBeAbleToSelect(this.berserker);
            expect(this.player2).not.toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should allow you to target an attacking character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.borderlandsDefender],
                province: this.sd1
            });
            this.player2.clickCard(this.fire);
            expect(this.player2).toBeAbleToSelect(this.berserker);
            expect(this.player2).not.toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should cost an honor to dishonor the chosen character', function() {
            let honor = this.player2.honor;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.borderlandsDefender],
                province: this.sd1
            });
            this.player2.clickCard(this.fire);
            this.player2.clickCard(this.berserker);
            expect(this.berserker.isDishonored).toBe(true);
            expect(this.player2.honor).toBe(honor - 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Fire and Oil, losing 1 honor to dishonor Matsu Berserker');
        });

        it('should trigger during a conflict at any province you control', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.borderlandsDefender],
                province: this.sd2
            });
            this.player2.clickCard(this.fire);
            this.player2.clickCard(this.berserker);
            expect(this.berserker.isDishonored).toBe(true);
        });

        it('should not trigger if it\'s on a broken province', function() {
            this.sd1.isBroken = true;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.borderlandsDefender],
                province: this.sd2
            });
            this.player2.clickCard(this.fire);
            this.player2.clickCard(this.berserker);
            expect(this.berserker.isDishonored).toBe(false);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not trigger on attack', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlandsDefender],
                defenders: [this.challenger]
            });
            this.player1.pass();
            this.player2.clickCard(this.fire);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
