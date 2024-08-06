describe('Take up Command', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shrewd-yasuki', 'vanguard-warrior']
                },
                player2: {
                    inPlay: ['borderlands-defender', 'doji-whisperer', 'young-harrier', 'brash-samurai', 'hida-guardian', 'doji-challenger', 'matsu-berserker'],
                    hand: ['take-up-command', 'retreat']
                }
            });

            this.yasuki = this.player1.findCardByName('shrewd-yasuki');
            this.warrior = this.player1.findCardByName('vanguard-warrior');

            this.borderlandsDefender = this.player2.findCardByName('borderlands-defender');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.harrier = this.player2.findCardByName('young-harrier');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.hidaGuardian = this.player2.findCardByName('hida-guardian');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.takeUpCommand = this.player2.findCardByName('take-up-command');
            this.retreat = this.player2.findCardByName('retreat');

            this.brash.bowed = true;
            this.whisperer.bowed = true;

            this.player1.pass();
            this.player2.playAttachment(this.takeUpCommand, this.borderlandsDefender);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yasuki],
                defenders: [this.borderlandsDefender, this.hidaGuardian, this.berserker]
            });
            this.berserker.bowed = true;
        });

        it('should be on the character and not the attachment', function() {
            this.player2.clickCard(this.takeUpCommand);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.borderlandsDefender);
            expect(this.player2).toHavePrompt('Choose a character');
        });

        it('should allow selecting a bushi that costs 2 or less that you control and is either bowed or not participating', function() {
            this.player2.clickCard(this.borderlandsDefender);
            expect(this.player2).not.toBeAbleToSelect(this.yasuki);
            expect(this.player2).not.toBeAbleToSelect(this.warrior);
            expect(this.player2).not.toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            expect(this.player2).toBeAbleToSelect(this.harrier);
            expect(this.player2).toBeAbleToSelect(this.brash);
            expect(this.player2).not.toBeAbleToSelect(this.hidaGuardian);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.berserker);
        });

        it('should ready and move in a bowed not participating character', function() {
            expect(this.brash.bowed).toBe(true);
            expect(this.brash.inConflict).toBe(false);
            this.player2.clickCard(this.borderlandsDefender);
            this.player2.clickCard(this.brash);
            expect(this.brash.bowed).toBe(false);
            expect(this.brash.inConflict).toBe(true);
            expect(this.getChatLogs(3)).toContain('player2 uses Borderlands Defender\'s gained ability from Take Up Command to ready Brash Samurai and move it into the conflict');
        });

        it('should move in a ready not participating character', function() {
            expect(this.harrier.bowed).toBe(false);
            expect(this.harrier.inConflict).toBe(false);
            this.player2.clickCard(this.borderlandsDefender);
            this.player2.clickCard(this.harrier);
            expect(this.harrier.bowed).toBe(false);
            expect(this.harrier.inConflict).toBe(true);
        });

        it('should ready a participating character', function() {
            expect(this.berserker.bowed).toBe(true);
            expect(this.berserker.inConflict).toBe(true);
            this.player2.clickCard(this.borderlandsDefender);
            this.player2.clickCard(this.berserker);
            expect(this.berserker.bowed).toBe(false);
            expect(this.berserker.inConflict).toBe(true);
        });

        it('should not work if not participating', function() {
            this.player2.clickCard(this.retreat);
            this.player2.clickCard(this.borderlandsDefender);
            expect(this.borderlandsDefender.inConflict).toBe(false);
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.borderlandsDefender);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should add commander trait', function() {
            expect(this.borderlandsDefender.hasTrait('commander')).toBe(true);
        });
    });
});
