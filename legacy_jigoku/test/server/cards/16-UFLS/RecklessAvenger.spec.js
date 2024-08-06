describe('Reckless Avenger', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-toshimoko', 'doji-challenger', 'reckless-avenger']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'reckless-avenger']
                }
            });
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.avenger1 = this.player1.findCardByName('reckless-avenger');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.avenger2 = this.player2.findCardByName('reckless-avenger');
        });

        it('cannot play if no one is bowed', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.avenger1);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should make each player choose a target in turn order and do things to the chosen targets (first player initiates)', function() {
            this.yoshi.bow();
            this.toshimoko.bow();
            this.player1.clickCard(this.avenger1);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.avenger2);
            expect(this.player1).not.toBeAbleToSelect(this.avenger1);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickCard(this.toshimoko);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.avenger2);
            expect(this.player2).not.toBeAbleToSelect(this.avenger1);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.yoshi);

            expect(this.toshimoko.bowed).toBe(false);
            expect(this.yoshi.bowed).toBe(true);
            expect(this.yoshi.isHonored).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 uses Reckless Avenger to ready Kakita Toshimoko and honor Kakita Yoshi');
        });

        it('should ready the 2nd character if the first player chooses not to pick someone', function() {
            this.yoshi.bow();
            this.toshimoko.bow();
            this.player1.clickCard(this.avenger1);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.avenger2);
            expect(this.player1).not.toBeAbleToSelect(this.avenger1);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickPrompt('Done');

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.avenger2);
            expect(this.player2).not.toBeAbleToSelect(this.avenger1);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.yoshi);

            expect(this.toshimoko.bowed).toBe(true);
            expect(this.yoshi.bowed).toBe(false);
            expect(this.yoshi.isHonored).toBe(false);

            expect(this.getChatLogs(5)).toContain('player1 uses Reckless Avenger to ready Kakita Yoshi');
        });

        it('should skip the 1st character if the first player has no legal targets', function() {
            this.yoshi.bow();
            this.player1.clickCard(this.avenger1);
            expect(this.player1).not.toHavePrompt('Choose a character');

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.avenger2);
            expect(this.player2).not.toBeAbleToSelect(this.avenger1);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.bowed).toBe(false);
            expect(this.yoshi.isHonored).toBe(false);

            expect(this.getChatLogs(5)).toContain('player1 uses Reckless Avenger to ready Kakita Yoshi');
        });

        it('should make each player choose a target in turn order (second player initiates)', function() {
            this.yoshi.bow();
            this.toshimoko.bow();
            this.player1.pass();
            this.player2.clickCard(this.avenger2);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.avenger2);
            expect(this.player1).not.toBeAbleToSelect(this.avenger1);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickCard(this.toshimoko);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.avenger2);
            expect(this.player2).not.toBeAbleToSelect(this.avenger1);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.yoshi);

            expect(this.toshimoko.bowed).toBe(false);
            expect(this.yoshi.bowed).toBe(true);
            expect(this.yoshi.isHonored).toBe(true);

            expect(this.getChatLogs(5)).toContain('player2 uses Reckless Avenger to ready Kakita Toshimoko and honor Kakita Yoshi');
        });
    });
});
