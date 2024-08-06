describe('Waterfall Tattoo', function() {
    integration(function() {
        describe('Waterfall Tattoo\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ancient-master']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves', 'brash-samurai'],
                        hand: ['waterfall-tattoo']
                    }
                });
                this.ancientMaster = this.player1.findCardByName('ancient-master');
                this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');
                this.brash = this.player2.findCardByName('brash-samurai');
                this.adeptOfTheWaves.bowed = true;
                this.waterfall = this.player2.findCardByName('waterfall-tattoo');

                this.shameful1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shameful2 = this.player2.findCardByName('shameful-display', 'province 1');
                this.shameful2.facedown = true;
                this.shameful1.facedown = true;
                this.player1.pass();
            });

            it('should only be playable on a character you control', function() {
                this.player2.clickCard(this.waterfall);
                expect(this.player2).not.toBeAbleToSelect(this.ancientMaster);
                expect(this.player2).toBeAbleToSelect(this.adeptOfTheWaves);
                expect(this.player2).toBeAbleToSelect(this.brash);
            });

            it('should add tattooed trait', function() {
                this.player2.playAttachment(this.waterfall, this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.hasTrait('tattooed')).toBe(true);
            });

            it('should prompt you to ready after a province you control is revealed', function() {
                this.player2.playAttachment(this.waterfall, this.adeptOfTheWaves);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: ['ancient-master'],
                    province: this.shameful2
                });

                expect(this.adeptOfTheWaves.bowed).toBe(true);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.waterfall);
                this.player2.clickCard(this.waterfall);
                expect(this.adeptOfTheWaves.bowed).toBe(false);

                expect(this.getChatLogs(5)).toContain('player2 uses Waterfall Tattoo to ready Adept of the Waves');
            });

            it('should not prompt you to ready after a province your opponent controls is revealed', function() {
                this.player2.playAttachment(this.waterfall, this.adeptOfTheWaves);
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash],
                    province: this.shameful1
                });

                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Choose defenders');
            });
        });
    });
});
