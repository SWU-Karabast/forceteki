describe('Cunning Negotiator', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['cunning-negotiator'],
                    hand: ['shinjo-ambusher'],
                    provinces: ['brother-s-gift-dojo']
                },
                player2: {
                    inPlay: ['cunning-negotiator'],
                    provinces: ['midnight-revels', 'restoration-of-balance', 'manicured-garden', 'meditations-on-the-tao']
                }
            });

            this.cunning = this.player1.findCardByName('cunning-negotiator');
            this.cunning2 = this.player2.findCardByName('cunning-negotiator');
            this.ambusher = this.player1.findCardByName('shinjo-ambusher');
            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
            this.restoration = this.player2.findCardByName('restoration-of-balance', 'province 2');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden', 'province 3');
            this.meditations = this.player2.findCardByName('meditations-on-the-tao', 'province 4');
            this.brothersGiftDojo = this.player1.findCardByName('brother-s-gift-dojo', 'province 1');

            this.revels.facedown = false;
            this.restoration.facedown = false;
            this.manicuredGarden.facedown = false;
            this.meditations.facedown = false;

            this.cunning.fate = 5;
            this.cunning2.fate = 5;

            this.game.checkGameState(true);
        });

        it('should initiate a duel - opponent picks their duelist', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.cunning);
        });

        it('should do nothing on a tie', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(10)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should let the winner choose to trigger the province ability - controller wins', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            expect(this.player2).toHavePrompt('Do you want to trigger a province ability?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
        });

        it('should let the winner choose to trigger the province ability - controller loses', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            expect(this.player1).toHavePrompt('Do you want to trigger a province ability?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');
        });

        it('should trigger the province ability for the winner', function() {
            this.noMoreActions();
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            expect(this.player2).toHavePrompt('Do you want to trigger a province ability?');
            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(10)).toContain('Duel Effect: resolve the action ability of an attacked province');
            expect(this.getChatLogs(10)).toContain('player2 chooses to trigger a province ability');
            expect(this.getChatLogs(10)).toContain('player2 uses Manicured Garden to gain 1 fate');
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player2.fate).toBe(fate + 1);
        });

        it('should do nothing if you decline triggering the province ability', function() {
            this.noMoreActions();
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            expect(this.player2).toHavePrompt('Do you want to trigger a province ability?');
            this.player2.clickPrompt('No');
            expect(this.getChatLogs(10)).toContain('Duel Effect: resolve the action ability of an attacked province');
            expect(this.getChatLogs(10)).toContain('player2 chooses not to trigger a province ability');
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player2.fate).toBe(fate);
        });

        it('should prevent using the province if you use the duel first', function() {
            this.noMoreActions();
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            this.player2.clickPrompt('Yes');
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicuredGarden);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player2.fate).toBe(fate + 1);
        });

        it('should not prevent using the province via the duel if you use the province first', function() {
            this.noMoreActions();
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.manicuredGarden);
            this.player1.pass();
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            this.player2.clickPrompt('Yes');
            expect(this.player2.fate).toBe(fate + 2);
        });

        it('should not prevent using the province if your opponent wins the duel', function() {
            this.noMoreActions();
            let p1Fate = this.player1.fate;
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('Yes');
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(p1Fate + 1);
            expect(this.player2.fate).toBe(fate + 1);
        });


        it('should do nothing if the attacked province has a reaction', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                type: 'military',
                province: this.revels
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickPrompt('Pass');
            this.player2.clickCard(this.cunning2);
            this.player2.clickPrompt('Done');
            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should disregard trigger conditions - interrupt', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'military',
                province: this.restoration
            });

            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should regard card text - mentions attacking characters', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'military',
                province: this.meditations
            });

            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Meditations on the Tao');
            expect(this.player1).toBeAbleToSelect(this.cunning);
            expect(this.player1).not.toBeAbleToSelect(this.cunning2);
            this.player1.clickCard(this.cunning);
            expect(this.getChatLogs(10)).toContain('player1 uses Meditations on the Tao to remove 1 fate from Cunning Negotiator');
        });

        it('should regard costs', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning2],
                defenders: [this.cunning],
                type: 'military',
                province: this.brothersGiftDojo
            });

            const honor = this.player2.honor;
            this.player1.clickCard(this.cunning);
            this.player2.clickCard(this.cunning2);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2'); //-1 honor
            this.player2.clickPrompt('Yes');

            expect(this.cunning2.isAttacking()).toBe(true);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.cunning);
            expect(this.player2).toBeAbleToSelect(this.cunning2);
            this.player2.clickCard(this.cunning2);

            expect(this.player2.honor).toBe(honor - 2); //duel + dojo cost
            expect(this.cunning2.isAttacking()).toBe(false);

            expect(this.getChatLogs(5)).toContain('player2 uses Brother’s Gift Dōjō, losing 1 honor to send Cunning Negotiator home');
        });

        it('shinjo ambusher should prevent the duel from triggering the province', function() {
            this.noMoreActions();
            let fate = this.player2.fate;

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2],
                type: 'political',
                province: this.manicuredGarden
            });
            this.player2.pass();
            this.player1.clickCard(this.ambusher);
            this.player1.clickPrompt('0');
            this.player1.clickPrompt('Conflict');
            this.player1.clickCard(this.ambusher);

            this.player2.clickCard(this.cunning2);
            this.player1.clickCard(this.cunning);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('2');
            this.player1.pass();
            expect(this.getChatLogs(5)).toContain('The duel has no effect');
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player2.fate).toBe(fate);
        });
    });
});

describe('Cunning Negotiator + Emperor', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['cunning-negotiator'],
                    hand: ['shinjo-ambusher'],
                    provinces: ['brother-s-gift-dojo']
                },
                player2: {
                    inPlay: ['cunning-negotiator', 'doji-whisperer', 'hantei-xxxviii'],
                    provinces: ['midnight-revels', 'restoration-of-balance', 'manicured-garden', 'meditations-on-the-tao']
                }
            });

            this.cunning = this.player1.findCardByName('cunning-negotiator');
            this.cunning2 = this.player2.findCardByName('cunning-negotiator');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.emperor = this.player2.findCardByName('hantei-xxxviii');
            this.ambusher = this.player1.findCardByName('shinjo-ambusher');
            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
            this.restoration = this.player2.findCardByName('restoration-of-balance', 'province 2');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden', 'province 3');
            this.meditations = this.player2.findCardByName('meditations-on-the-tao', 'province 4');
            this.brothersGiftDojo = this.player1.findCardByName('brother-s-gift-dojo', 'province 1');
        });

        it('should work (by not allowing emperor to react to the duel)', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [this.cunning2, this.whisperer],
                type: 'political',
                province: this.manicuredGarden
            });

            this.player2.pass();
            this.player1.clickCard(this.cunning);
            expect(this.player2).not.toBeAbleToSelect(this.emperor);
        });
    });
});
