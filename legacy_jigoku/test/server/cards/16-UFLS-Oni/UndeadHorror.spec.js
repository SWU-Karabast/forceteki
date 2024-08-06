describe('Undead Horror', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['undead-horror', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni', 'doji-challenger'],
                    dynastyDiscard: ['kakita-toshimoko']
                }
            });
            this.horror = this.player1.findCardByName('undead-horror');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.noMoreActions();
        });

        it('should trigger and attach an opponent\'s character to itself after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.horror],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.horror);
            this.player1.clickCard(this.horror);
            expect(this.toshimoko.location).toBe('play area');
            expect(this.toshimoko.type).toBe('attachment');
            expect(this.horror.attachments).toContain(this.toshimoko);
            expect(this.horror.getMilitarySkill()).toBe(6);
            expect(this.horror.getPoliticalSkill()).toBe(5);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Undead Horror to attach a random character from player2\'s dynasty discard pile to Undead Horror'
            );
            expect(this.getChatLogs(5)).toContain('Kakita Toshimoko is attached to Undead Horror');
        });

        it('random', function () {
            this.player1.moveCard(this.maraudingOni, 'dynasty discard pile');
            this.initiateConflict({
                attackers: [this.horror],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.horror);
            this.player1.clickCard(this.horror);
            const hasTosh = this.horror.attachments.includes(this.toshimoko);
            const hasOni = this.horror.attachments.includes(this.maraudingOni);
            const hasChallenger = this.horror.attachments.includes(this.challenger);
            expect(hasTosh || hasOni || hasChallenger).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Undead Horror to attach a random character from player2\'s dynasty discard pile to Undead Horror'
            );
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.horror],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
