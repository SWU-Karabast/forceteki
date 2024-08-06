describe('Third Tower', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['matsu-berserker']
                },
                player2: {
                    inPlay: ['doji-challenger'],
                    dynastyDeck: ['third-tower', 'kaiu-forges', 'imperial-storehouse']
                }
            });
            this.tower = this.player2.placeCardInProvince('third-tower', 'province 1');
            this.imperialStorehouse = this.player2.placeCardInProvince('imperial-storehouse', 'province 2');
            this.forges = this.player2.placeCardInProvince('kaiu-forges', 'province 3');
            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p1Honor = this.player1.honor;
            this.p2Honor = this.player2.honor;
        });

        it('should trigger when an attack is declared against a province without a kaiu wall and take an honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                province: this.sd2,
                attackers: ['matsu-berserker']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.tower);
            this.player2.clickCard(this.tower);
            expect(this.player1.honor).toBe(this.p1Honor - 1);
            expect(this.player2.honor).toBe(this.p2Honor + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Third Tower to take 1 honor from player1');
        });

        it('should trigger when an attack is declared against a province with a facedown holding', function() {
            this.forges.facedown = true;
            this.noMoreActions();
            this.initiateConflict({
                province: this.sd3,
                attackers: ['matsu-berserker']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.tower);
        });

        it('should not trigger when an attack is declared against a province with a kaiu wall', function() {
            this.noMoreActions();
            this.initiateConflict({
                province: this.sd1,
                attackers: ['matsu-berserker']
            });
            expect(this.player2).toHavePrompt('Choose defenders');
        });

        it('should not trigger when the controller declares an attack', function() {
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            this.noMoreActions();
            this.initiateConflict({
                attackers: ['doji-challenger']
            });
            expect(this.player1).toHavePrompt('Choose defenders');
        });

        it('shouldn\'t trigger when Third Tower is facedown', function() {
            this.tower.facedown = true;
            this.noMoreActions();
            this.initiateConflict({
                province: this.sd2,
                attackers: ['matsu-berserker']
            });
            expect(this.player2).toHavePrompt('Choose defenders');
        });
    });
});
