describe('Doji Shigenobu', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-shigenobu', 'doji-whisperer', 'brash-samurai']
                },
                player2: {
                    inPlay: ['bayushi-dairu']
                }
            });
            this.shigenobu = this.player1.findCardByName('doji-shigenobu');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.dairu = this.player2.findCardByName('bayushi-dairu');

            this.brash.honor();
        });

        it('should bow an enemy at the cost of bowing your participating then ask if you want to move home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.shigenobu],
                defenders: [this.dairu]
            });

            this.player2.pass();

            this.player1.clickCard(this.shigenobu);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.shigenobu);
            expect(this.player1).toBeAbleToSelect(this.dairu);
            this.player1.clickCard(this.dairu);

            expect(this.dairu.bowed).toBe(false);

            expect(this.player1).toHavePrompt('Select card to bow');
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.shigenobu);

            this.player1.clickCard(this.whisperer);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Dōji Shigenobu, bowing Doji Whisperer to bow Bayushi Dairu'
            );

            expect(this.player1).toHavePrompt('Do you want to move home?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');

            expect(this.shigenobu.isParticipating()).toBe(true);
            this.player1.clickPrompt('Yes');
            expect(this.shigenobu.isParticipating()).toBe(false);
            expect(this.getChatLogs('5')).toContain('player1 chooses to move Dōji Shigenobu home');
        });

        it('choosing not to move home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.shigenobu],
                defenders: [this.dairu]
            });

            this.player2.pass();

            this.player1.clickCard(this.shigenobu);
            this.player1.clickCard(this.dairu);
            this.player1.clickCard(this.whisperer);

            expect(this.player1).toHavePrompt('Do you want to move home?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');

            expect(this.shigenobu.isParticipating()).toBe(true);
            this.player1.clickPrompt('No');
            expect(this.shigenobu.isParticipating()).toBe(true);
            expect(this.getChatLogs('5')).not.toContain('player1 chooses to move Dōji Shigenobu home');
        });
    });
});