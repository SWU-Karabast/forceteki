describe('Chronicler of Calamities', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shiba-tsukune', 'kakita-toshimoko', 'bayushi-manipulator', 'togashi-yoshi']
                },
                player2: {
                    inPlay: ['chronicler-of-calamities', 'hantei-sotorii'],
                    conflictDiscard: ['ceaseless-duty']
                }
            });

            this.tsukune = this.player1.findCardByName('shiba-tsukune');
            this.yoshi = this.player1.findCardByName('togashi-yoshi');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.manipulator.dishonor();

            this.chronicler = this.player2.findCardByName('chronicler-of-calamities');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.duty = this.player2.findCardByName('ceaseless-duty');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tsukune, this.toshimoko, this.manipulator, this.yoshi],
                defenders: [this.chronicler, this.sotorii]
            });
        });

        it('Send home', function () {
            this.player2.clickCard(this.chronicler);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.manipulator);
            expect(this.player2).not.toBeAbleToSelect(this.chronicler);
            expect(this.player2).toBeAbleToSelect(this.sotorii);
            this.player2.clickCard(this.toshimoko);

            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Move it home');
            expect(this.player2).toHavePromptButton('Dishonor it');
            expect(this.player2).toHavePromptButton('Sacrifice a character to perform both');
            this.player2.clickPrompt('Move it home');
            expect(this.getChatLogs(5)).toContain('player2 uses Chronicler of Calamities to dishonor or send home Kakita Toshimoko');
            expect(this.getChatLogs(5)).toContain('player2 chooses to send Kakita Toshimoko home');
            expect(this.toshimoko.isParticipating()).toBe(false);
            expect(this.toshimoko.isDishonored).toBe(false);
        });

        it('Dishonor', function () {
            this.player2.clickCard(this.chronicler);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickPrompt('Dishonor it');

            expect(this.getChatLogs(5)).toContain('player2 uses Chronicler of Calamities to dishonor or send home Kakita Toshimoko');
            expect(this.getChatLogs(5)).toContain('player2 chooses to dishonor Kakita Toshimoko');
            expect(this.toshimoko.isParticipating()).toBe(true);
            expect(this.toshimoko.isDishonored).toBe(true);
        });

        it('Should not be able to cancel the sacrifice', function () {
            this.player2.moveCard(this.duty, 'hand');
            this.game.checkGameState(true);

            this.player2.clickCard(this.chronicler);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickPrompt('Sacrifice a character to perform both');

            expect(this.player2).toHavePrompt('Select a character to sacrifice');
            expect(this.player2).toBeAbleToSelect(this.chronicler);
            expect(this.player2).toBeAbleToSelect(this.sotorii);
            this.player2.clickCard(this.sotorii);

            expect(this.getChatLogs(5)).toContain('player2 uses Chronicler of Calamities to dishonor or send home Kakita Toshimoko');
            expect(this.getChatLogs(5)).toContain('player2 chooses to sacrifice a character to both dishonor and send Kakita Toshimoko home');
            expect(this.getChatLogs(5)).toContain('player2 chooses to sacrifice Hantei Sotorii');
            expect(this.sotorii.location).toBe('dynasty discard pile');
            expect(this.toshimoko.isParticipating()).toBe(false);
            expect(this.toshimoko.isDishonored).toBe(true);

            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
