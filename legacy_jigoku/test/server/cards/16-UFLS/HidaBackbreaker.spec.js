describe('Hida Backbreaker', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-backbreaker', 'shiba-tsukune']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'isawa-ujina'],
                    hand: ['cloud-the-mind']
                }
            });
            this.hida = this.player1.findCardByName('hida-backbreaker');
            this.shibaTsukune = this.player1.findCardByName('shiba-tsukune');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.ujina = this.player2.findCardByName('isawa-ujina');
            this.cloud = this.player2.findCardByName('cloud-the-mind');
            this.noMoreActions();
        });

        it('should trigger and honor a character after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.hida, this.shibaTsukune],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hida);
            this.player1.clickCard(this.hida);
            expect(this.player1).not.toBeAbleToSelect(this.hida);
            expect(this.player1).not.toBeAbleToSelect(this.shibaTsukune);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.ujina);
            this.player1.clickCard(this.daidojiUji);
            expect(this.daidojiUji.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Hida Backbreaker to dishonor Daidoji Uji');
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.shibaTsukune],
                defenders: [this.daidojiUji],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.hida],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('no opponents attachments', function () {
            this.initiateConflict({
                attackers: [this.shibaTsukune],
                defenders: [this.daidojiUji],
                type: 'political'
            });
            this.player2.clickCard(this.cloud);
            expect(this.player2).toBeAbleToSelect(this.shibaTsukune);
            expect(this.player2).toBeAbleToSelect(this.ujina);
            expect(this.player2).toBeAbleToSelect(this.daidojiUji);
            expect(this.player2).not.toBeAbleToSelect(this.hida);
        });
    });
});
