describe('Forest of Rustling Whispers', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'shiba-tsukune']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'doji-challenger'],
                    provinces: ['forest-of-rustling-whispers', 'manicured-garden']
                }
            });
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.tsukune = this.player1.findCardByName('shiba-tsukune');
            this.uji = this.player2.findCardByName('daidoji-uji');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.forest = this.player2.findCardByName('forest-of-rustling-whispers');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.noMoreActions();
        });

        it('should let you pick a participating character', function () {
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.uji],
                province: this.forest
            });
            this.player2.clickCard(this.forest);
            expect(this.player2).toBeAbleToSelect(this.diplomat);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should let you honor or dishonor - honoring', function () {
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.uji],
                province: this.forest
            });
            this.player2.clickCard(this.forest);
            this.player2.clickCard(this.uji);
            expect(this.player2).toHavePrompt('Select an action:');
            expect(this.player2).toHavePromptButton('Honor this character');
            expect(this.player2).toHavePromptButton('Dishonor this character');
            this.player2.clickPrompt('Honor this character');
            expect(this.uji.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Forest of Rustling Whispers to honor or dishonor Daidoji Uji');
            expect(this.getChatLogs(5)).toContain('player2 chooses to honor Daidoji Uji');
        });

        it('should let you honor or dishonor - dishonoring', function () {
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.uji],
                province: this.forest
            });
            this.player2.clickCard(this.forest);
            this.player2.clickCard(this.uji);
            expect(this.player2).toHavePrompt('Select an action:');
            expect(this.player2).toHavePromptButton('Honor this character');
            expect(this.player2).toHavePromptButton('Dishonor this character');
            this.player2.clickPrompt('Dishonor this character');
            expect(this.uji.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 chooses to dishonor Daidoji Uji');
        });

        it('should let you honor or dishonor - no choice', function () {
            this.uji.honor();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.uji],
                province: this.forest
            });
            this.player2.clickCard(this.forest);
            this.player2.clickCard(this.uji);
            expect(this.player2).toHavePrompt('Select an action:');
            expect(this.player2).not.toHavePromptButton('Honor this character');
            expect(this.player2).toHavePromptButton('Dishonor this character');
            this.player2.clickPrompt('Dishonor this character');
            expect(this.uji.isHonored).toBe(false);
            expect(this.uji.isDishonored).toBe(false);
        });

        it('should not trigger at a different province', function () {
            this.forest.facedown = true;
            this.uji.honor();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.uji],
                province: this.garden
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.forest);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
