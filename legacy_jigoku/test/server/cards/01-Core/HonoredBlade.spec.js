describe('Honored Blade', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'hisu-mori-toride-unicorn',
                    inPlay: ['aggressive-moto', 'border-rider', 'ide-trader'],
                    hand: ['honored-blade']
                },
                player2: {
                    inPlay: ['hida-guardian']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.borderRider = this.player1.findCardByName('border-rider');
            this.ideTrader = this.player1.findCardByName('ide-trader');
            this.blade = this.player1.findCardByName('honored-blade');
            this.hmt = this.player1.findCardByName('hisu-mori-toride-unicorn');

            this.hidaGuardian = this.player2.findCardByName('hida-guardian');

            this.player1.playAttachment(this.blade, this.borderRider);
            this.noMoreActions();
        });

        it('should not react if you sac the parent during resolution', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.aggressiveMoto, this.borderRider],
                defenders: [this.hidaGuardian]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.blade);
            expect(this.player1).toBeAbleToSelect(this.hmt);
            this.player1.clickCard(this.hmt);
            this.player1.clickCard(this.borderRider);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.blade);
        });
    });
});
