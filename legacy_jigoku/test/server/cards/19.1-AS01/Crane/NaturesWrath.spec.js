describe('Natures Wrath', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'shosuro-sadako']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'keeper-initiate'],
                    hand: ['nature-s-wrath']
                }
            });

            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.uji = this.player2.findCardByName('daidoji-uji');
            this.keeper = this.player2.findCardByName('keeper-initiate');
            this.wrath = this.player2.findCardByName('nature-s-wrath');
        });

        it('auto sends home dishonored characters', function () {
            this.sadako.dishonor();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sadako],
                defenders: [this.uji]
            });

            this.player2.clickCard(this.wrath);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.sadako);
            expect(this.player1).not.toHavePrompt('Select one');
            expect(this.sadako.isParticipating()).toBe(false);
            expect(this.sadako.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 plays Nature\'s Wrath to send Shosuro Sadako home');
        });

        it('let opponent choose to go home home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sadako],
                defenders: [this.uji]
            });

            this.player2.clickCard(this.wrath);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.sadako);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Dishonor this character');
            expect(this.player1).toHavePromptButton('Move this character home');

            this.player1.clickPrompt('Move this character home');
            expect(this.sadako.isParticipating()).toBe(false);
            expect(this.sadako.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 plays Nature\'s Wrath to send Shosuro Sadako home');
        });

        it('let opponent choose to go dishonor their character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sadako],
                defenders: [this.uji]
            });

            this.player2.clickCard(this.wrath);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.sadako);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Dishonor this character');
            expect(this.player1).toHavePromptButton('Move this character home');

            this.player1.clickPrompt('Dishonor this character');
            expect(this.sadako.isParticipating()).toBe(true);
            expect(this.sadako.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 plays Nature\'s Wrath to dishonor Shosuro Sadako');
        });

        it('can dishonor participating character to use it again', function () {
            this.sadako.dishonor();
            this.uji.honor();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sadako, this.diplomat],
                defenders: [this.uji]
            });

            this.player2.clickCard(this.wrath);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.sadako);
            expect(this.sadako.isParticipating()).toBe(false);
            expect(this.sadako.isDishonored).toBe(true);

            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Dishonor a participating character to resolve this ability again');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Dishonor a participating character to resolve this ability again');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.keeper);

            this.player2.clickCard(this.uji);
            expect(this.uji.isOrdinary()).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player2 chooses to dishonor Daidoji Uji to resolve Nature\'s Wrath again'
            );

            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.diplomat);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Dishonor this character');
            expect(this.player1).toHavePromptButton('Move this character home');

            this.player1.clickPrompt('Dishonor this character');
            expect(this.diplomat.isParticipating()).toBe(true);
            expect(this.diplomat.isDishonored).toBe(true);

            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Dishonor a participating character for no effect');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Dishonor a participating character for no effect');
            this.player2.clickCard(this.uji);

            expect(this.uji.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 chooses to dishonor Daidoji Uji for no effect');

            expect(this.player2).not.toHavePrompt('Choose a character');
        });
    });
});
