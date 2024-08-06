describe('Yogo Tadashi', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['doji-challenger', 'border-rider'],
                    hand: ['way-of-the-crane']
                },
                player2: {
                    honor: 10,
                    inPlay: ['yogo-tadashi', 'kakita-yoshi'],
                    hand: ['way-of-the-scorpion']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.tadashi = this.player2.findCardByName('yogo-tadashi');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.rider = this.player1.findCardByName('border-rider');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.scorpion = this.player2.findCardByName('way-of-the-scorpion');
        });

        it('should react to being assigned and prompt you to choose a character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.tadashi, this.yoshi]
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.tadashi);
            this.player2.clickCard(this.tadashi);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.tadashi);
        });

        it('should prevent the chosen character from being chosen as a target', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.tadashi, this.yoshi]
            });
            this.player2.clickCard(this.tadashi);
            this.player2.clickCard(this.challenger);

            expect(this.getChatLogs(5)).toContain('player2 uses Yogo Tadashi to prevent Doji Challenger from being targeted by events played by player1');
            this.player2.clickCard(this.scorpion);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.isDishonored).toBe(true);
            this.player1.clickCard(this.crane);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.pass();
        });
    });
});
