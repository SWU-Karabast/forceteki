describe('Rejuvenating Vapors', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['rejuvenating-vapors', 'stride-the-waves'],
                    inPlay: ['adept-of-the-waves', 'solemn-scholar', 'garanto-guardian']
                },
                player2: {
                    inPlay: ['prodigy-of-the-waves']
                }
            });

            this.rejuvenatingVapors = this.player1.findCardByName('rejuvenating-vapors');
            this.strideTheWaves = this.player1.findCardByName('stride-the-waves');
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.solemn = this.player1.findCardByName('solemn-scholar');
            this.garantoGuardian = this.player1.findCardByName('garanto-guardian');
            this.adept.bow();
            this.solemn.bow();
            this.garantoGuardian.bow();

            this.player1.playAttachment(this.strideTheWaves, this.solemn);
            this.player2.pass();
        });

        it('with affinity, it readies a character', function () {
            this.player1.clickCard(this.rejuvenatingVapors);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.adept);
            expect(this.player1).toBeAbleToSelect(this.solemn);
            expect(this.player1).toBeAbleToSelect(this.garantoGuardian);

            this.player1.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Rejuvenating Vapors to ready Garanto Guardian');
        });

        it('without affinity, it readies a shugenja', function () {
            this.player1.moveCard(this.adept, 'dynasty discard pile');

            this.player1.clickCard(this.rejuvenatingVapors);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.garantoGuardian);

            this.player1.clickCard(this.solemn);
            expect(this.solemn.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Rejuvenating Vapors to ready Solemn Scholar');
        });
    });
});