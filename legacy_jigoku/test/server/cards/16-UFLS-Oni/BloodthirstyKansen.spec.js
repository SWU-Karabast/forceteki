describe('Bloodthirsty Kansen', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bloodthirsty-kansen', 'seeker-of-knowledge']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.kansen = this.player1.findCardByName('bloodthirsty-kansen');
            this.seeker = this.player1.findCardByName('seeker-of-knowledge');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');

            this.kansen.taint();
            this.noMoreActions();
        });

        it('should trigger and resolve the contested ring after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.kansen],
                defenders: [],
                ring: 'air'
            });
            let honor = this.player1.honor;

            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.kansen);
            this.player1.clickCard(this.kansen);
            this.player1.clickPrompt('Gain 2 honor');
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.getChatLogs(5)).toContain('player1 uses Bloodthirsty Kansen to resolve Air Ring');
            expect(this.player1.honor).toBe(honor + 4);
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.seeker],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.seeker],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should work with gained elements', function () {
            this.initiateConflict({
                attackers: [this.kansen, this.seeker],
                defenders: [],
                ring: 'earth'
            });

            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.kansen);
            this.player1.clickCard(this.kansen);
            expect(this.player1).toHavePrompt('Resolve Ring Effect');
            expect(this.player1).toHavePromptButton('Earth Ring');
            expect(this.player1).toHavePromptButton('Air Ring');
        });
    });
});
