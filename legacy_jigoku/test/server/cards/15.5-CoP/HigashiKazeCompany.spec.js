describe('Higashi Kaze Company', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['higashi-kaze-company', 'border-rider', 'moto-youth']
                },
                player2: {
                    inPlay: ['kakita-yoshi']
                }
            });

            this.company = this.player1.findCardByName('higashi-kaze-company');
            this.rider = this.player1.findCardByName('border-rider');
            this.youth = this.player1.findCardByName('moto-youth');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');

            this.rider.fate = 1;
        });

        it('should allow targeting a character with no fate that is not itself if it wins a conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.company, this.rider, this.youth],
                defenders: [this.yoshi]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.company);
            this.player1.clickCard(this.company);
            expect(this.player1).not.toBeAbleToSelect(this.company);
            expect(this.player1).not.toBeAbleToSelect(this.rider);
            expect(this.player1).toBeAbleToSelect(this.youth);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
        });

        it('should prevent the character from bowing', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.company, this.rider, this.youth],
                defenders: [this.yoshi]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.company);
            this.player1.clickCard(this.company);
            this.player1.clickCard(this.youth);
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');

            expect(this.company.bowed).toBe(true);
            expect(this.youth.bowed).toBe(false);
        });

        it('should not trigger if you lose', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.company, this.rider, this.youth],
                defenders: [this.yoshi]
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('chat message', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.company, this.rider, this.youth],
                defenders: [this.yoshi]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.company);
            this.player1.clickCard(this.company);
            this.player1.clickCard(this.youth);
            expect(this.getChatLogs(5)).toContain('player1 uses Higashi Kaze Company to prevent Moto Youth from bowing at the end of the conflict');
        });
    });
});
