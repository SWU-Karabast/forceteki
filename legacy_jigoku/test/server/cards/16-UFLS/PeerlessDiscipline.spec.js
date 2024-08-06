describe('Peerless Discipline', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['border-rider', 'doji-whisperer', 'akodo-toturi'],
                    hand: ['peerless-discipline']
                },
                player2: {
                    inPlay: ['goblin-sneak']
                }
            });

            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.borderRider = this.player1.findCardByName('border-rider');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.peerless = this.player1.findCardByName('peerless-discipline');
            this.goblin = this.player2.findCardByName('goblin-sneak');

            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
        });

        it('should give all characters +1 military and bushi', function() {
            expect(this.whisperer.hasTrait('bushi')).toBe(false);
            this.player1.clickCard(this.peerless);
            expect(this.borderRider.getMilitarySkill()).toBe(3);
            expect(this.whisperer.getMilitarySkill()).toBe(1);
            expect(this.toturi.getMilitarySkill()).toBe(7);
            expect(this.whisperer.hasTrait('bushi')).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Peerless Discipline to give all characters they control +1military and the Bushi trait');
        });

        it('should expire at the end of the phase', function() {
            expect(this.whisperer.hasTrait('bushi')).toBe(false);
            this.player1.clickCard(this.peerless);
            expect(this.borderRider.getMilitarySkill()).toBe(3);
            expect(this.whisperer.getMilitarySkill()).toBe(1);
            expect(this.toturi.getMilitarySkill()).toBe(7);
            expect(this.whisperer.hasTrait('bushi')).toBe(true);

            this.noMoreActions();

            expect(this.borderRider.getMilitarySkill()).toBe(2);
            expect(this.whisperer.getMilitarySkill()).toBe(0);
            expect(this.toturi.getMilitarySkill()).toBe(6);
            expect(this.whisperer.hasTrait('bushi')).toBe(false);
        });
    });
});
